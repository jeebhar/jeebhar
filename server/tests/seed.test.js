import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { defaultContent } from '../src/seed/default-content.js';
import { describeDrift, wantsOverwrite } from '../src/seed/seed.helpers.js';

/**
 * Regression tests for "I ran the seeder and nothing changed".
 *
 * The cause was not the seeder's logic but the npm plumbing: a root script that
 * delegates with `npm --prefix server run seed` lets the outer npm swallow
 * `--force` as one of its own flags, so the inner script received no arguments
 * and silently skipped. The last test here guards that.
 */

describe('wantsOverwrite', () => {
  it('detects --force and --overwrite', () => {
    assert.equal(wantsOverwrite(['--force']), true);
    assert.equal(wantsOverwrite(['--overwrite']), true);
  });

  it('is false with no arguments', () => {
    assert.equal(wantsOverwrite([]), false);
  });

  it('does not match a partial or similar flag', () => {
    assert.equal(wantsOverwrite(['--forced']), false);
    assert.equal(wantsOverwrite(['force']), false);
    assert.equal(wantsOverwrite(['-f']), false);
  });
});

describe('describeDrift', () => {
  it('reports nothing when stored content matches the defaults', () => {
    assert.deepEqual(describeDrift(defaultContent, defaultContent), []);
  });

  it('reports a collection the stored document is missing entirely', () => {
    const legacy = { ...defaultContent };
    delete legacy.travelReels;

    const drift = describeDrift(legacy, defaultContent);
    const travel = drift.find((entry) => entry.field === 'travelReels');

    assert.ok(travel, 'travelReels should be reported as drifted');
    assert.equal(travel.stored, 0);
    assert.equal(travel.defaults, defaultContent.travelReels.length);
  });

  it('reports the old sample content as drifted on every collection that changed', () => {
    // Roughly the first release's content: 3 work items, 3 reels, no travel reels.
    const legacy = {
      services: defaultContent.services,
      work: [1, 2, 3],
      reels: [1, 2, 3],
      mediaKitMetrics: defaultContent.mediaKitMetrics,
    };

    const fields = describeDrift(legacy, defaultContent).map((entry) => entry.field);

    assert.deepEqual(fields.sort(), ['reels', 'travelReels', 'work']);
  });

  it('handles a null document', () => {
    assert.ok(describeDrift(null, defaultContent).length > 0);
  });
});

describe('npm script argument forwarding', () => {
  const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

  it('every delegating root script forwards its arguments', () => {
    // `npm --prefix x run y` without a trailing `--` lets npm consume the user's
    // flags instead of passing them on. This is what made `npm run seed -- --force`
    // silently do nothing.
    const root = read('../../package.json');

    const offenders = Object.entries(root.scripts)
      .filter(([, command]) => /^npm --prefix \S+ run \S+$/.test(command.trim()))
      .map(([name]) => name);

    assert.deepEqual(
      offenders,
      [],
      `these root scripts drop arguments; append " --": ${offenders.join(', ')}`
    );
  });

  it('exposes seed:force so no flag has to survive npm', () => {
    const root = read('../../package.json');
    const server = read('../package.json');

    assert.ok(root.scripts['seed:force'], 'root needs a seed:force script');
    assert.ok(server.scripts['seed:force'], 'server needs a seed:force script');
    assert.match(server.scripts['seed:force'], /--force/);
  });
});
