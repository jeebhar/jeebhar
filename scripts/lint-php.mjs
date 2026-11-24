#!/usr/bin/env node
/** npm run lint:api — `php -l` on every PHP file in api/ (syntax check, no dependencies). */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== 'data') walk(path);
    } else if (name.endsWith('.php') && name !== 'config.php') {
      files.push(path);
    }
  }
};
walk('api');

for (const file of files) {
  execFileSync('php', ['-l', file], { stdio: ['ignore', 'ignore', 'inherit'] });
}
console.log(`PHP syntax OK (${files.length} files)`);
