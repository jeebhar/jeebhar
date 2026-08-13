import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

/**
 * Guard for the test script's discovery.
 *
 * `npm test` runs a bare `node --test`, which auto-discovers files by name. That
 * is the portable choice (the glob form needs Node 21+, and a shell glob would
 * not work on Windows), but it means any file under src/ whose name looks like a
 * test gets executed as one. `src/scripts/mail-test.js` matched `*-test.js` and
 * was run as a test suite, where it exited non-zero and failed the build.
 */

// The patterns Node's test runner matches, minus the tests/ directory itself.
const looksLikeATest = (name) =>
  /\.test\.[cm]?js$/.test(name) ||
  /-test\.[cm]?js$/.test(name) ||
  /_test\.[cm]?js$/.test(name) ||
  /^test-.*\.[cm]?js$/.test(name) ||
  /^test\.[cm]?js$/.test(name);

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === 'node_modules' ? [] : walk(full);
    }
    return [{ dir, name: entry, full }];
  });

describe('test discovery', () => {
  it('no file under src/ is named like a test', () => {
    const src = new URL('../src', import.meta.url).pathname;

    const offenders = walk(src)
      .filter((file) => looksLikeATest(file.name))
      .map((file) => file.full);

    assert.deepEqual(
      offenders,
      [],
      `these files would be run as tests by "node --test"; rename them: ${offenders.join(', ')}`
    );
  });

  it('no directory under src/ is named "test"', () => {
    const src = new URL('../src', import.meta.url).pathname;
    const offenders = walk(src)
      .map((file) => file.dir)
      .filter((dir) => /[/\\]test$/.test(dir));

    assert.deepEqual([...new Set(offenders)], []);
  });
});
