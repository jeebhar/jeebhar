#!/usr/bin/env node
/**
 * npm run build:bluehost
 *
 * Produces dist-bluehost/ — an exact mirror of what belongs in public_html:
 *
 *   dist-bluehost/
 *   ├── index.html, assets/, brand/ …   the React build (client/dist)
 *   ├── index.php                       serves every page with SEO tags + content
 *   ├── .htaccess                       HTTPS, www → apex, routing, caching
 *   ├── api/                            PHP API + generated config.php
 *   └── uploads/.htaccess               blocks code execution in uploads
 *
 * Everything is derived from jeebhar.config.json.
 */

import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ROOT, htaccess, loadConfig, phpConfig, viteEnv } from './lib/config.mjs';

const OUT = resolve(ROOT, 'dist-bluehost');
const step = (message) => console.log(`\n▸ ${message}`);

const config = loadConfig();

step('Building the React frontend');
execSync('npm --prefix client run build', {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, ...viteEnv(config) },
});

step('Assembling dist-bluehost/');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Frontend — without source maps, which would publish the source code.
cpSync(resolve(ROOT, 'client/dist'), OUT, {
  recursive: true,
  filter: (source) => !source.endsWith('.map'),
});

// API — runtime files only (no tests, no dev router, no local data).
cpSync(resolve(ROOT, 'api'), resolve(OUT, 'api'), {
  recursive: true,
  filter: (source) => {
    const relative = source.slice(resolve(ROOT, 'api').length).replace(/\\/g, '/');
    return !/^\/(tests|data)(\/|$)|^\/dev-router\.php$|^\/config\.php$/.test(relative);
  },
});
writeFileSync(resolve(OUT, 'api/config.php'), phpConfig(config, 'bluehost'));

writeFileSync(
  resolve(OUT, '.htaccess'),
  htaccess(config, readFileSync(resolve(ROOT, 'deploy/public_html.htaccess'), 'utf8'))
);
mkdirSync(resolve(OUT, 'uploads'), { recursive: true });
cpSync(resolve(ROOT, 'deploy/uploads.htaccess'), resolve(OUT, 'uploads/.htaccess'));

// Server-rendered entry page: SEO tags + crawlable content around index.html.
cpSync(resolve(ROOT, 'deploy/index.php'), resolve(OUT, 'index.php'));

if (!existsSync(resolve(OUT, 'index.html'))) {
  throw new Error('Build output is missing index.html');
}

console.log(`
✔ Ready: dist-bluehost/

  Deploy with SSH:   npm run deploy:bluehost
  Or by hand:        upload the CONTENTS of dist-bluehost/ into public_html
                     (Bluehost File Manager or FTP). Show hidden files so the
                     .htaccess files are included.
`);
