/**
 * Wraps an async route handler so a rejected promise reaches Express's error
 * pipeline. Removes the repeated try/catch that would otherwise sit in every
 * controller.
 *
 * @template {import('express').RequestHandler} T
 * @param {T} handler
 * @returns {import('express').RequestHandler}
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
