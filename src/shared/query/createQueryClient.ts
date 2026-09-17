import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/apiError';

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          failureCount < 1 &&
          error instanceof ApiError &&
          (error.kind === 'network' ||
            error.kind === 'timeout' ||
            (error.kind === 'http' && (error.status ?? 0) >= 500)),
        retryDelay: 1_000,
        staleTime: 60_000,
      },
    },
  });
