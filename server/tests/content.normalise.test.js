import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ContentService } from '../src/services/content.service.js';

/**
 * Regression tests for the "blank site" failure.
 *
 * Mongoose applies schema defaults when a document is created, not when an
 * existing one is read. A document written before `travelReels` existed came
 * back without it, reached the frontend as `undefined`, and crashed the render —
 * the whole page went blank.
 *
 * The API's response shape must therefore be a guarantee, independent of when
 * the stored document happened to be written.
 */

/** A document exactly as the first release wrote it. */
const legacyDocument = () => ({
  _id: 'abc',
  brandName: 'Jeebhar',
  heroHeading: 'Legacy heading',
  heroSubheading: 'Legacy subheading',
  services: [{ title: 'Brand', shortDescription: 'a', longDescription: 'b' }],
  work: [{ title: 'Spice Route Bistro', imageUrl: 'https://x/a.jpg', description: 'd' }],
  reels: [{ title: 'Kitchen Rush', thumbnailUrl: 'https://x/t.jpg', instagramUrl: 'https://i/' }],
  mediaKitMetrics: [{ label: 'Followers', value: '250K+' }],
  contact: { address: 'a', email: 'e@e.com', phone: '1' },
  // No heroEyebrow, no mediaKitUrl, no travelReels — all added later.
});

const repositoryFor = (document) => ({
  async findSingleton() {
    return document;
  },
  async create(payload) {
    return payload;
  },
  async replaceSingleton(payload) {
    return payload;
  },
});

describe('ContentService.complete', () => {
  it('adds a collection the stored document predates', () => {
    const result = ContentService.complete(legacyDocument());

    assert.deepEqual(result.travelReels, []);
  });

  it('guarantees every collection is an array', () => {
    const result = ContentService.complete({});

    for (const field of ['services', 'work', 'reels', 'travelReels', 'mediaKitMetrics']) {
      assert.ok(Array.isArray(result[field]), `${field} should be an array`);
    }
  });

  it('replaces a non-array value with an empty array', () => {
    // Defends against a hand-edited document as well as an old one.
    const result = ContentService.complete({ work: null, reels: 'nope', travelReels: 42 });

    assert.deepEqual(result.work, []);
    assert.deepEqual(result.reels, []);
    assert.deepEqual(result.travelReels, []);
  });

  it('adds scalars the stored document predates', () => {
    const result = ContentService.complete(legacyDocument());

    assert.equal(result.heroEyebrow, '');
    assert.equal(result.mediaKitUrl, '/brand/media-kit.pdf');
  });

  it('fills missing contact fields without discarding the stored ones', () => {
    const result = ContentService.complete(legacyDocument());

    assert.equal(result.contact.email, 'e@e.com');
    assert.equal(result.contact.tiktokUrl, '');
    assert.equal(result.contact.instagramUrl, '');
  });

  it('never overwrites data that is present', () => {
    const stored = {
      ...legacyDocument(),
      heroEyebrow: 'For restaurants',
      mediaKitUrl: '/brand/custom.pdf',
      travelReels: [{ title: 'Travel reel 01', thumbnailUrl: '', instagramUrl: 'https://i/9' }],
    };

    const result = ContentService.complete(stored);

    assert.equal(result.heroEyebrow, 'For restaurants');
    assert.equal(result.mediaKitUrl, '/brand/custom.pdf');
    assert.equal(result.travelReels.length, 1);
    assert.equal(result.work[0].title, 'Spice Route Bistro');
  });

  it('does not mutate the document it was given', () => {
    const stored = legacyDocument();

    ContentService.complete(stored);

    assert.equal('travelReels' in stored, false);
  });

  it('survives a null or undefined document', () => {
    for (const input of [null, undefined]) {
      const result = ContentService.complete(input);
      assert.deepEqual(result.travelReels, []);
      assert.equal(result.brandName, 'Jeebhar');
    }
  });
});

describe('ContentService read/write normalisation', () => {
  it('normalises what getContent returns from an old document', async () => {
    const service = new ContentService(repositoryFor(legacyDocument()), {});

    const content = await service.getContent();

    assert.deepEqual(content.travelReels, []);
    assert.equal(content.mediaKitUrl, '/brand/media-kit.pdf');
  });

  it('normalises a freshly seeded document too', async () => {
    const repository = repositoryFor(null);
    const service = new ContentService(repository, { brandName: 'Jeebhar', work: [] });

    const content = await service.getContent();

    assert.deepEqual(content.travelReels, []);
    assert.deepEqual(content.reels, []);
  });

  it('normalises the result of a write, so a PUT response is the same shape', async () => {
    const service = new ContentService(repositoryFor(legacyDocument()), {});

    const content = await service.replaceContent({ brandName: 'Jeebhar', heroHeading: 'New' });

    assert.deepEqual(content.travelReels, []);
    assert.deepEqual(content.services, []);
  });
});
