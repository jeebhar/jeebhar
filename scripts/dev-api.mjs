#!/usr/bin/env node
/**
 * npm run dev:api
 *
 * Local PHP API for development: writes api/config.php from
 * jeebhar.config.json, then starts PHP's built-in server. Vite proxies /api and
 * /uploads here, so the site at http://localhost:5173 behaves like Bluehost.
 *
 * Needs PHP 8.1+ on your PATH (Windows: `winget install PHP.PHP.8.3`).
 *
 * A fresh Windows PHP has openssl (needed to send mail over SMTP), mbstring
 * and fileinfo switched off and often no php.ini at all. Rather than asking you
 * to edit php.ini, this script switches on whichever of them is missing, for
 * this server only, using the DLLs that ship in PHP's own ext/ folder.
 */

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { ROOT, loadConfig, phpConfig } from './lib/config.mjs';

// Secrets are optional locally: without SMTP, enquiries are still saved to api/data.
const config = loadConfig({ requireSecrets: false });
writeFileSync(resolve(ROOT, 'api/config.php'), phpConfig(config, 'dev'));

const WANTED = ['openssl', 'mbstring', 'fileinfo'];

/** `-d` flags that load missing extensions from PHP's ext/ folder, if found there. */
const extensionFlags = () => {
  let probe;
  try {
    const script = `echo json_encode(['bin' => PHP_BINARY, 'dir' => ini_get('extension_dir'), 'on' => array_values(array_filter(${JSON.stringify(WANTED).replace(/"/g, "'")}, 'extension_loaded'))]);`;
    probe = JSON.parse(execFileSync('php', ['-r', script], { encoding: 'utf8' }));
  } catch {
    return []; // php missing: the spawn below reports it
  }

  const missing = WANTED.filter((name) => !probe.on.includes(name));
  if (missing.length === 0) return [];

  // Prefer the configured extension_dir; fall back to <php folder>/ext.
  const candidates = [probe.dir, join(dirname(probe.bin), 'ext')].filter(Boolean);
  const fileFor = (dir, name) =>
    [`php_${name}.dll`, `${name}.so`]
      .map((file) => join(dir, file))
      .find((path) => existsSync(path));
  const dir = candidates.find((candidate) => missing.some((name) => fileFor(candidate, name)));
  if (!dir) {
    console.warn(`PHP extensions not enabled: ${missing.join(', ')}. Enable them in php.ini.`);
    return [];
  }

  const loadable = missing.filter((name) => fileFor(dir, name));
  console.log(`Enabling PHP extensions for this server: ${loadable.join(', ')}`);
  return ['-d', `extension_dir=${dir}`, ...loadable.flatMap((name) => ['-d', `extension=${name}`])];
};

const port = config.dev?.apiPort ?? 5000;
console.log(`PHP API on http://localhost:${port}/api  (data in api/data, uploads in uploads/)`);

const php = spawn('php', [...extensionFlags(), '-S', `localhost:${port}`, 'api/dev-router.php'], {
  cwd: ROOT,
  stdio: 'inherit',
});
php.on('error', () => {
  console.error('Could not start PHP. Install PHP 8.1+ and make sure `php` is on your PATH.');
  process.exit(1);
});
php.on('exit', (code) => process.exit(code ?? 0));
