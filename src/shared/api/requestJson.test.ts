import { fetch } from 'expo/fetch';
import { jsonResponse } from '@/testing/http';
import { requestJson } from './requestJson';

const mockFetch = jest.mocked(fetch);
beforeEach(() => mockFetch.mockReset());
afterEach(() => jest.useRealTimers());

it('returns unknown JSON and sends Accept plus an abort signal', async () => {
  mockFetch.mockResolvedValue(jsonResponse({ id: 1 }));
  await expect(requestJson('https://example.com')).resolves.toEqual({ id: 1 });
  expect(mockFetch).toHaveBeenCalledWith(
    'https://example.com',
    expect.objectContaining({
      headers: { Accept: 'application/json' },
      signal: expect.any(AbortSignal),
    }),
  );
});

it.each([404, 500])('preserves HTTP status %i', async (status) => {
  mockFetch.mockResolvedValue(jsonResponse({}, status));
  await expect(requestJson('https://example.com')).rejects.toMatchObject({ kind: 'http', status });
});

it('classifies network failures', async () => {
  mockFetch.mockRejectedValue(new TypeError('network'));
  await expect(requestJson('https://example.com')).rejects.toMatchObject({ kind: 'network' });
});

it('classifies invalid JSON', async () => {
  const response = jsonResponse(null);
  response.json = async () => {
    throw new SyntaxError('invalid');
  };
  mockFetch.mockResolvedValue(response);
  await expect(requestJson('https://example.com')).rejects.toMatchObject({
    kind: 'invalid-response',
  });
});

it('does not start an already cancelled request', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(
    requestJson('https://example.com', { signal: controller.signal }),
  ).rejects.toMatchObject({ name: 'AbortError' });
  expect(mockFetch).not.toHaveBeenCalled();
});

it('forwards cancellation to the transport and cleans up the listener', async () => {
  const controller = new AbortController();
  const remove = jest.spyOn(controller.signal, 'removeEventListener');
  mockFetch.mockImplementation(
    (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }),
  );
  const request = requestJson('https://example.com', { signal: controller.signal });
  const assertion = expect(request).rejects.toMatchObject({ name: 'AbortError' });
  controller.abort();
  await assertion;
  expect(mockFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  expect(remove).toHaveBeenCalled();
});

it('turns a timeout into a retryable error and clears timers', async () => {
  jest.useFakeTimers();
  mockFetch.mockImplementation(
    (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }),
  );
  const request = requestJson('https://example.com', { timeoutMs: 100 });
  const assertion = expect(request).rejects.toMatchObject({ kind: 'timeout' });
  await jest.advanceTimersByTimeAsync(100);
  await assertion;
  expect(jest.getTimerCount()).toBe(0);
});
