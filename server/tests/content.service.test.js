import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ContentService } from '../src/services/content.service.js';

const seed = { brandName: 'Jeebhar', heroHeading: 'Seeded' };

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

    assert.deepEqual(content, seed);
    assert.deepEqual(calls, ['find', 'create']);
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

    assert.deepEqual(content, stored);
    assert.deepEqual(calls, ['find']);
  });

  it('delegates writes straight to the repository', async () => {
    const received = [];
    const repository = {
      async findSingleton() {
        return null;
      },
      async create(p) {
        return p;
      },
      async replaceSingleton(payload) {
        received.push(payload);
        return payload;
      },
    };

    const payload = { brandName: 'Jeebhar', heroHeading: 'Updated' };
    const result = await new ContentService(repository, seed).replaceContent(payload);

    assert.deepEqual(result, payload);
    assert.deepEqual(received, [payload]);
  });
});
