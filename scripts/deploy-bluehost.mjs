#!/usr/bin/env node
/**
 * npm run deploy:bluehost
 *
 * Uploads dist-bluehost/ to Bluehost over SSH in three steps:
 *   1. pack dist-bluehost/ into one archive    (tar, built into Windows 10+)
 *   2. copy it to the server                   (scp, built into Windows 10+)
 *   3. unpack it over public_html              (ssh)
 *
 * Unpacking only adds and replaces files. Uploaded images in public_html/uploads
 * and everything in ~/jeebhar-data (content, enquiries) are never touched.
 *
 * First time: enable SSH in Bluehost and add your public key, or type the
 * cPanel password when ssh asks for it.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { ROOT, loadConfig } from './lib/config.mjs';

const config = loadConfig();
const { sshHost, sshUser, sshPort = 22, remoteWebRoot = 'public_html' } = config.bluehost ?? {};

if (!sshHost || !sshUser || sshUser === 'your-cpanel-username') {
  throw new Error('Set bluehost.sshHost and bluehost.sshUser in jeebhar.config.json.');
}
if (!existsSync(resolve(ROOT, 'dist-bluehost/index.html'))) {
  throw new Error('dist-bluehost/ is missing. Run npm run build:bluehost first.');
}

const archive = 'jeebhar-release.tgz';
const target = `${sshUser}@${sshHost}`;
const run = (command, args) => {
  console.log(`\n▸ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit' });
};

try {
  run('tar', ['-czf', archive, '-C', 'dist-bluehost', '.']);
  run('scp', ['-P', String(sshPort), archive, `${target}:${archive}`]);
  run('ssh', [
    '-p',
    String(sshPort),
    target,
    `mkdir -p ${remoteWebRoot} && tar -xzf ${archive} -C ${remoteWebRoot} && rm ${archive} && echo "Deployed to ~/${remoteWebRoot}"`,
  ]);
} finally {
  rmSync(resolve(ROOT, archive), { force: true });
}

console.log(`\n✔ Live. Check https://${config.domains.primary}/api/health`);
