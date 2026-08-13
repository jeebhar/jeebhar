import { HttpError } from '../utils/http-error.js';

/**
 * MIDDLEWARE — validates and normalises `req.body` against a Zod schema.
 *
 * Parsed output is attached to `req.validated` and the raw body is left
 * untouched, so controllers consume only data that has already passed the
 * schema. One factory serves every route (Open/Closed: new routes add a schema,
 * not a new middleware).
 *
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || '(body)',
      message: issue.message,
    }));

    next(HttpError.badRequest('Validation failed.', details));
    return;
  }

  req.validated = result.data;
  next();
};
