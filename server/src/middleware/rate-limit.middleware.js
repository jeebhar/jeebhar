import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';

/**
 * MIDDLEWARE — request throttling.
 *
 * `apiLimiter` protects the API broadly; `contactLimiter` is much tighter
 * because POST /api/contact writes to the database and sends mail.
 */

const shared = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { ok: false, message: 'Too many requests. Please try again later.' },
};

export const apiLimiter = rateLimit({
  ...shared,
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
});

export const contactLimiter = rateLimit({
  ...shared,
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.contactMax,
  message: {
    ok: false,
    message: 'Too many enquiries from this address. Please try again later.',
  },
});
