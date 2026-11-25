/**
 * Loads jeebhar.config.json — the single source of every setting — and derives
 * what each part of the system needs from it:
 *
 *   phpConfig()     → contents of api/config.php        (server secrets)
 *   viteEnv()       → VITE_* variables baked into the frontend (no secrets!)
 *   htaccess()      → public_html/.htaccess             (HTTPS, www, SPA routing)
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CONFIG_FILE = resolve(ROOT, 'jeebhar.config.json');

/** Removes "$comment" keys so they never reach generated files. */
const stripComments = (value) => {
  if (Array.isArray(value)) return value.map(stripComments);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== '$comment')
        .map(([key, child]) => [key, stripComments(child)])
    );
  }
  return value;
};

export const loadConfig = ({ requireSecrets = true } = {}) => {
  if (!existsSync(CONFIG_FILE)) {
    throw new Error(
      'jeebhar.config.json not found.\n' +
        '  Copy jeebhar.config.example.json to jeebhar.config.json and fill it in.'
    );
  }

  const config = stripComments(JSON.parse(readFileSync(CONFIG_FILE, 'utf8')));
  const problems = [];

  if (requireSecrets) {
    if ((config.admin?.token ?? '').length < 16) {
      problems.push('admin.token must be at least 16 characters.');
    }
    if (!config.mail?.to) problems.push('mail.to is required (where enquiries are sent).');
    if (config.mail?.transport === 'smtp' && !config.mail?.smtp?.pass) {
      problems.push('mail.smtp.pass is empty (or set mail.transport to "mail").');
    }
  }
  if (!config.domains?.primary) problems.push('domains.primary is required.');

  if (problems.length > 0) {
    throw new Error(`jeebhar.config.json is incomplete:\n  - ${problems.join('\n  - ')}`);
  }
  return config;
};

/** @param {'bluehost' | 'dev'} target */
export const phpConfig = (config, target) => {
  const origins = [];
  for (const site of config.domains.sites ?? []) {
    origins.push(`https://${site.host}`, `https://www.${site.host}`);
  }
  if (target === 'dev') origins.push('http://localhost:5173', 'http://127.0.0.1:5173');

  const values = {
    admin: { token: config.admin?.token ?? '' },
    mail: config.mail ?? {},
    uploads: config.uploads ?? {},
    rateLimit: config.rateLimit ?? {},
    site: config.site ?? {},
    // The page renderer needs the domains for hreflang, canonical and language.
    domains: { primary: config.domains.primary, sites: config.domains.sites ?? [] },
    cors: { allowedOrigins: origins },
    paths:
      target === 'bluehost'
        ? {
            // public_html/api → ~/jeebhar-data, outside the web root.
            dataDir: `../../${config.bluehost?.remoteDataDir ?? 'jeebhar-data'}`,
            uploadsDir: '../uploads',
            uploadsUrl: '/uploads',
          }
        : { dataDir: 'data', uploadsDir: '../uploads', uploadsUrl: '/uploads' },
  };

  const json = JSON.stringify(values, null, 2);
  return [
    '<?php',
    '// GENERATED from jeebhar.config.json — do not edit. Regenerate with npm run build:bluehost.',
    "return json_decode(<<<'JEEBHAR_JSON'",
    json,
    'JEEBHAR_JSON, true);',
    '',
  ].join('\n');
};

/** Public, non-secret values for the frontend. */
export const viteEnv = (config) => ({
  VITE_API_BASE_URL: '/api',
  VITE_DOMAIN_LANGUAGES: JSON.stringify(
    Object.fromEntries((config.domains.sites ?? []).map((s) => [s.host, s.defaultLanguage ?? 'en']))
  ),
});

export const htaccess = (config, template) =>
  template.replace(
    '# {{WWW_REDIRECT}}',
    config.domains.redirectWwwToApex === false
      ? '# www redirect disabled in jeebhar.config.json'
      : [
          '# www.jeebhar.* → jeebhar.* (same domain, no www)',
          'RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]',
          'RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]',
        ].join('\n')
  );
