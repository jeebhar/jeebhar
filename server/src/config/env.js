import dotenv from 'dotenv';

dotenv.config();

/**
 * Single source of truth for configuration.
 *
 * Every other module reads configuration from here instead of touching
 * `process.env` directly. That keeps the rest of the codebase independent of
 * the environment (Dependency Inversion) and means a missing variable fails
 * loudly at boot rather than silently at request time.
 */

/**
 * Reads a string variable, trimmed.
 *
 * `.env` files pick up trailing spaces very easily (a copied credential, an
 * editor that does not strip them). An untrimmed SMTP password or host fails
 * authentication with an error that looks nothing like "there is a stray space",
 * so every string is trimmed at the boundary.
 */
const str = (value, fallback = '') => (value ?? fallback).trim();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt((value ?? '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .concat(value ? [] : fallback);

export const env = Object.freeze({
  nodeEnv: str(process.env.NODE_ENV, 'development'),
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: toInt(process.env.PORT, 5000),
  logLevel: str(process.env.LOG_LEVEL, 'info'),

  corsOrigins: toList(process.env.CLIENT_ORIGIN, ['http://localhost:5173']),

  mongoUri: str(process.env.MONGODB_URI),

  adminToken: str(process.env.ADMIN_TOKEN),

  mail: Object.freeze({
    host: str(process.env.SMTP_HOST),
    port: toInt(process.env.SMTP_PORT, 587),
    user: str(process.env.SMTP_USER),
    pass: str(process.env.SMTP_PASS),
    to: str(process.env.MAIL_TO),
    from: str(process.env.MAIL_FROM),
  }),

  rateLimit: Object.freeze({
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 100),
    contactMax: toInt(process.env.RATE_LIMIT_CONTACT_MAX, 5),
  }),
});

/** Variables without which the process must not start. */
const REQUIRED = [
  ['MONGODB_URI', env.mongoUri],
  ['ADMIN_TOKEN', env.adminToken],
];

/**
 * Validates configuration at boot.
 * @throws {Error} when a required variable is missing.
 */
export const assertEnv = () => {
  const missing = REQUIRED.filter(([, value]) => !value).map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy server/.env.example to server/.env and fill them in.'
    );
  }

  if (env.isProduction && env.adminToken.length < 24) {
    throw new Error('ADMIN_TOKEN must be at least 24 characters in production.');
  }
};

/**
 * Hosts that ship in example files. A placeholder is worse than a blank value:
 * it looks configured, so delivery fails silently instead of being skipped.
 */
const PLACEHOLDER_HOSTS = ['smtp.example.com', 'smtp.yourhost.com', 'localhost.example'];

export const isPlaceholderMailHost = () => PLACEHOLDER_HOSTS.includes(env.mail.host.toLowerCase());

/** True when SMTP is fully configured with a real host. */
export const isMailConfigured = () =>
  Boolean(env.mail.host && env.mail.user && env.mail.pass && env.mail.to && env.mail.from) &&
  !isPlaceholderMailHost();
