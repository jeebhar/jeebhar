import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * Regression test: a placeholder SMTP host must count as "not configured".
 *
 * server/.env had SMTP_HOST=smtp.example.com carried over from the example file,
 * with a real Gmail user and password. Delivery therefore failed on every
 * submission while the form reported success — the worst kind of failure, because
 * nothing anywhere said the mail had not been sent.
 */

const withEnv = async (vars, assertion) => {
  const previous = { ...process.env };
  Object.assign(process.env, vars);
  // A fresh module instance, since env is frozen at import time.
  const module = await import(`../src/config/env.js?t=${Math.random().toString(36).slice(2)}`);
  try {
    await assertion(module);
  } finally {
    for (const key of Object.keys(vars)) delete process.env[key];
    Object.assign(process.env, previous);
  }
};

const FULL = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017/x',
  ADMIN_TOKEN: 'token',
  SMTP_USER: 'jeebhar410@gmail.com',
  SMTP_PASS: 'abcdefghijklmnop',
  MAIL_TO: 'jeebhar410@gmail.com',
  MAIL_FROM: 'jeebhar410@gmail.com',
};

describe('mail configuration', () => {
  it('treats the example placeholder host as not configured', async () => {
    await withEnv(
      { ...FULL, SMTP_HOST: 'smtp.example.com' },
      ({ isMailConfigured, isPlaceholderMailHost }) => {
        assert.equal(isPlaceholderMailHost(), true);
        assert.equal(isMailConfigured(), false);
      }
    );
  });

  it('accepts a real host', async () => {
    await withEnv(
      { ...FULL, SMTP_HOST: 'smtp.gmail.com' },
      ({ isMailConfigured, isPlaceholderMailHost }) => {
        assert.equal(isPlaceholderMailHost(), false);
        assert.equal(isMailConfigured(), true);
      }
    );
  });

  it('trims stray whitespace out of credentials', async () => {
    // A copied app password very often arrives with a trailing space, which fails
    // authentication with an error that does not mention whitespace at all.
    await withEnv(
      {
        ...FULL,
        SMTP_HOST: '  smtp.gmail.com  ',
        SMTP_PASS: 'abcdefghijklmnop ',
        SMTP_USER: ' me@gmail.com ',
      },
      ({ env, isMailConfigured }) => {
        assert.equal(env.mail.host, 'smtp.gmail.com');
        assert.equal(env.mail.pass, 'abcdefghijklmnop');
        assert.equal(env.mail.user, 'me@gmail.com');
        assert.equal(isMailConfigured(), true);
      }
    );
  });

  it('is not configured when a required field is blank', async () => {
    await withEnv({ ...FULL, SMTP_HOST: 'smtp.gmail.com', MAIL_TO: '' }, ({ isMailConfigured }) => {
      assert.equal(isMailConfigured(), false);
    });
  });
});
