import { fetch } from 'expo/fetch';
import { ApiError, createAbortError } from './apiError';

type RequestOptions = Readonly<{ signal?: AbortSignal; timeoutMs?: number }>;

export const requestJson = async (
  url: string,
  { signal, timeoutMs = 10_000 }: RequestOptions = {},
): Promise<unknown> => {
  const controller = new AbortController();
  let didTimeout = false;
  const handleAbort = () => controller.abort();
  signal?.addEventListener('abort', handleAbort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);
  try {
    if (controller.signal.aborted) throw createAbortError();
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (controller.signal.aborted) throw createAbortError();
    if (!response.ok) throw new ApiError('http', response.status);
    let result: unknown;
    try {
      result = await response.json();
    } catch (error) {
      throw new ApiError('invalid-response', undefined, error);
    }
    if (controller.signal.aborted) throw createAbortError();

    return result;
  } catch (error) {
    if (signal?.aborted) throw createAbortError();
    if (didTimeout) throw new ApiError('timeout', undefined, error);
    if (error instanceof ApiError) throw error;
    throw new ApiError('network', undefined, error);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', handleAbort);
  }
};
