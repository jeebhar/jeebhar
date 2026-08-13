import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';

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
