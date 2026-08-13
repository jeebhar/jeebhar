import { HttpError } from '../utils/http-error.js';

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
