import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ContentService } from '../src/services/content.service.js';

const seed = { brandName: 'Jeebhar', heroHeading: 'Seeded', heroSubheading: 'Sub' };

describe('ContentService', () => {
  it('seeds default content the first time it is read', async () => {
    const calls = [];
    const repository = {
      async findSingleton() {
        calls.push('find');
        return null;
      },
      async create(payload) {
        calls.push('create');
        return payload;
      },
      async replaceSingleton(payload) {
        calls.push('replace');
        return payload;
      },
    };

    const content = await new ContentService(repository, seed).getContent();

    assert.deepEqual(calls, ['find', 'create']);
    assert.equal(content.heroHeading, 'Seeded');
    // Read responses are normalised, so the shape is a guarantee.
    assert.deepEqual(content.travelReels, []);
  });

  it('returns existing content without re-seeding', async () => {
    const stored = { brandName: 'Jeebhar', heroHeading: 'Live copy' };
    const calls = [];
    const repository = {
      async findSingleton() {
        calls.push('find');
        return stored;
      },
      async create() {
        calls.push('create');
        throw new Error('must not seed over existing content');
      },
    };

    const content = await new ContentService(repository, seed).getContent();

    assert.deepEqual(calls, ['find']);
    assert.equal(content.heroHeading, 'Live copy');
  });

  it('delegates writes straight to the repository', async () => {
    const received = [];
    const repository = {
      async findSingleton() {
        return null;
      },
      async create(payload) {
        return payload;
      },
      async replaceSingleton(payload) {
        received.push(payload);
        return payload;
      },
    };

    const payload = { brandName: 'Jeebhar', heroHeading: 'Updated' };
    const result = await new ContentService(repository, seed).replaceContent(payload);

    // The service passes the caller's payload through untouched...
    assert.deepEqual(received, [payload]);
    // ...and normalises only what it hands back.
    assert.equal(result.heroHeading, 'Updated');
    assert.deepEqual(result.reels, []);
  });
});
