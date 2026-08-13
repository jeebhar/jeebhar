import { timingSafeEqual } from 'node:crypto';

import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

/**
 * MIDDLEWARE — shared-secret guard for write endpoints.
 *
 * Accepts the token as `Authorization: Bearer <token>` or `x-admin-token`.
 * Compared in constant time so the endpoint does not leak the token's prefix
 * through response timing.
 */

const extractToken = (req) => {
  const header = req.get('authorization') ?? '';
  if (header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  return (req.get('x-admin-token') ?? '').trim();
};

const matches = (candidate, expected) => {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/** @type {import('express').RequestHandler} */
export const requireAdmin = (req, _res, next) => {
  if (!env.adminToken) {
    next(HttpError.internal('ADMIN_TOKEN is not configured on the server.'));
    return;
  }

  const token = extractToken(req);

  if (!token) {
    next(HttpError.unauthorized('Admin token missing.'));
    return;
  }

  if (!matches(token, env.adminToken)) {
    next(HttpError.forbidden('Invalid admin token.'));
    return;
  }

  next();
};
