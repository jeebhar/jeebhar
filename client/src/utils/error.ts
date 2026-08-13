import { ApiError } from '../services/http-client';

export const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export const toFieldErrors = (error: unknown): Record<string, string> => {
  if (!(error instanceof ApiError) || !error.details) {
    return {};
  }

  return error.details.reduce<Record<string, string>>((accumulator, detail) => {
    accumulator[detail.field] = detail.message;
    return accumulator;
  }, {});
};
