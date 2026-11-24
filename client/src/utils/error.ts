import { ApiError } from '../services/http-client';

/**
 * Turns an unknown thrown value into a message safe to show a visitor.
 *
 * Every catch block routes through here so error copy is consistent and a raw
 * stack or object never lands on screen.
 */
export const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

/** Extracts field-level messages from a validation failure, if any. */
export const toFieldErrors = (error: unknown): Record<string, string> => {
  if (!(error instanceof ApiError) || !error.details) {
    return {};
  }

  return error.details.reduce<Record<string, string>>((accumulator, detail) => {
    accumulator[detail.field] = detail.message;
    return accumulator;
  }, {});
};
