#!/usr/bin/env node
/**
 * npm run dev:api
 *
 * Local PHP API for development: writes api/config.php from
 * jeebhar.config.json, then starts PHP's built-in server. Vite proxies /api and
 * /uploads here, so the site at http://localhost:5173 behaves like Bluehost.
 *
 * Needs PHP 8.1+ on your PATH (Windows: `winget install PHP.PHP.8.3`).
 */

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ROOT, loadConfig, phpConfig } from './lib/config.mjs';

// Secrets are optional locally: without SMTP, enquiries are still saved to api/data.
const config = loadConfig({ requireSecrets: false });
writeFileSync(resolve(ROOT, 'api/config.php'), phpConfig(config, 'dev'));

const port = config.dev?.apiPort ?? 5000;
console.log(`PHP API on http://localhost:${port}/api  (data in api/data, uploads in uploads/)`);

const php = spawn('php', ['-S', `localhost:${port}`, 'api/dev-router.php'], {
  cwd: ROOT,
  stdio: 'inherit',
});
php.on('error', () => {
  console.error('Could not start PHP. Install PHP 8.1+ and make sure `php` is on your PATH.');
  process.exit(1);
});
php.on('exit', (code) => process.exit(code ?? 0));
