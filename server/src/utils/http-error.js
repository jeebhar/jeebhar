export class HttpError extends Error {
  /**
   * @param {number} status HTTP status code.
   * @param {string} message Client-safe message.
   * @param {object} [options]
   * @param {unknown} [options.details] Field-level detail, e.g. validation issues.
   * @param {Error}   [options.cause] Underlying error, kept for logs only.
   */
  constructor(status, message, { details, cause } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
    this.cause = cause;
    this.expected = true;
    Error.captureStackTrace?.(this, HttpError);
  }

  static badRequest(message = 'Invalid request.', details) {
    return new HttpError(400, message, { details });
  }

  static unauthorized(message = 'Authentication required.') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'Not allowed.') {
    return new HttpError(403, message);
  }

  static notFound(message = 'Resource not found.') {
    return new HttpError(404, message);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new HttpError(429, message);
  }

  static internal(message = 'Unexpected server error.', cause) {
    return new HttpError(500, message, { cause });
  }
}
