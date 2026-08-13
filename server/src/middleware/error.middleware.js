import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';
import { logger } from '../utils/logger.js';

/**
 * MIDDLEWARE — the single place errors become HTTP responses.
 *
 * Controllers and services throw; this module decides status codes, redacts
 * unexpected internals in production, and logs. Nothing else formats an error.
 */

/** 404 for unmatched routes — runs after all route definitions. */
export const notFoundHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Maps framework/driver errors onto our own error type. */
const normalise = (error) => {
  if (error instanceof HttpError) {
    return error;
  }

  if (error?.name === 'ValidationError') {
    const details = Object.values(error.errors ?? {}).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));
    return HttpError.badRequest('Validation failed.', details);
  }

  if (error?.name === 'CastError') {
    return HttpError.badRequest(`Invalid value for "${error.path}".`);
  }

  if (error?.code === 11000) {
    return HttpError.badRequest('Duplicate value.', error.keyValue);
  }

  if (error?.type === 'entity.too.large') {
    return new HttpError(413, 'Request payload too large.');
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return HttpError.badRequest('Malformed JSON body.');
  }

  return HttpError.internal(error?.message, error);
};

/** @type {import('express').ErrorRequestHandler} */
export const errorHandler = (error, req, res, _next) => {
  const httpError = normalise(error);

  if (httpError.status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${httpError.status}`, error);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${httpError.status}: ${httpError.message}`);
  }

  // Never leak internals of an unexpected failure to the client in production.
  const message =
    httpError.status >= 500 && env.isProduction ? 'Unexpected server error.' : httpError.message;

  res.status(httpError.status).json({
    ok: false,
    message,
    ...(httpError.details ? { details: httpError.details } : {}),
  });
};
