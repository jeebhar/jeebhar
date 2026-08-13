import dotenv from 'dotenv';

dotenv.config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .concat(value ? [] : fallback);

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: toInt(process.env.PORT, 5000),
  logLevel: process.env.LOG_LEVEL ?? 'info',

  corsOrigins: toList(process.env.CLIENT_ORIGIN, ['http://localhost:5173']),

  mongoUri: process.env.MONGODB_URI ?? '',

  adminToken: process.env.ADMIN_TOKEN ?? '',

  mail: Object.freeze({
    host: process.env.SMTP_HOST ?? '',
    port: toInt(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    to: process.env.MAIL_TO ?? '',
    from: process.env.MAIL_FROM ?? '',
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

/** True when SMTP is fully configured; mail delivery is optional. */
export const isMailConfigured = () =>
  Boolean(env.mail.host && env.mail.user && env.mail.pass && env.mail.to && env.mail.from);
