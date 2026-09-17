import type { fetch } from 'expo/fetch';

type FetchResponse = Awaited<ReturnType<typeof fetch>>;

export const jsonResponse = (payload: unknown, status = 200): FetchResponse =>
  ({ ok: status >= 200 && status < 300, status, json: async () => payload }) as FetchResponse;
