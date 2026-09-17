export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'invalid-response' | 'invalid-input';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
    cause?: unknown,
  ) {
    super(kind === 'http' ? 'HTTP ' + status : kind, { cause });
    this.name = 'ApiError';
  }
}

export const createAbortError = (): Error => {
  const error = new Error('Request cancelled');
  error.name = 'AbortError';

  return error;
};

export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.';
  switch (error.kind) {
    case 'network':
      return 'Cannot connect. Check your connection and try again.';
    case 'timeout':
      return 'The request took too long. Please try again.';
    case 'invalid-response':
      return 'The service returned unexpected data. Please try again.';
    case 'invalid-input':
      return 'Please provide a valid user ID.';
    case 'http':
      return error.status === 404
        ? 'This item could not be found.'
        : 'The service is unavailable. Please try again.';
  }
};
