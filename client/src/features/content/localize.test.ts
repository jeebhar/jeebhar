import { describe, expect, it } from 'vitest';

import { localizeContent, pick } from './localize';
import type { SiteContentDocument } from '../../models/site-content.model';

const doc = {
  brandName: 'Jeebhar',
  heroEyebrow: { en: 'For restaurants', de: '' },
  heroHeading: { en: 'Reimagine', de: 'Neu denken' },
  heroSubheading: { en: 'Sub', de: 'Unter' },
  heroImageUrl: '/brand/hero-banner.jpg',
  seoTitle: { en: 'Title', de: 'Titel' },
  seoDescription: { en: 'Description', de: 'Beschreibung' },
  mediaKitUrl: '/brand/media-kit.pdf',
  services: [
    {
      _id: 's1',
      title: { en: 'Brand', de: 'Marke' },
      shortDescription: { en: 'Short', de: '' },
      longDescription: { en: 'Long', de: 'Lang' },
    },
  ],
  work: [
    {
      _id: 'w1',
      title: { en: 'Thai', de: 'Thai' },
      imageUrl: '/a.jpg',
      description: { en: 'D', de: '' },
    },
  ],
  reels: [
    {
      _id: 'r1',
      title: { en: 'Reel', de: 'Reel DE' },
      thumbnailUrl: '',
      instagramUrl: 'https://i/1',
    },
  ],
  travelReels: [],
  mediaKitMetrics: [{ _id: 'm1', label: { en: 'Followers', de: 'Follower' }, value: '10K' }],
  contact: {
    address: 'Frankfurt',
    email: 'hello@jeebhar.com',
    phone: '+49',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
  },
} satisfies SiteContentDocument;

describe('localizeContent', () => {
  it('returns German text where it exists', () => {
    const de = localizeContent(doc, 'de');
    expect(de.heroHeading).toBe('Neu denken');
    expect(de.services[0].title).toBe('Marke');
    expect(de.mediaKitMetrics[0].label).toBe('Follower');
    expect(de.reels[0].title).toBe('Reel DE');
  });

  it('falls back to English where the German text is blank', () => {
    const de = localizeContent(doc, 'de');
    expect(de.heroEyebrow).toBe('For restaurants');
    expect(de.services[0].shortDescription).toBe('Short');
  });

  it('leaves language-neutral fields untouched', () => {
    const de = localizeContent(doc, 'de');
    expect(de.work[0].imageUrl).toBe('/a.jpg');
    expect(de.mediaKitMetrics[0].value).toBe('10K');
    expect(de.contact).toBe(doc.contact);
  });
});

describe('pick', () => {
  it('accepts a plain string from content saved before translations existed', () => {
    expect(pick('Old heading', 'de')).toBe('Old heading');
  });

  it('treats whitespace-only German as missing', () => {
    expect(pick({ en: 'Hello', de: '   ' }, 'de')).toBe('Hello');
  });

  it('returns an empty string for missing text instead of throwing', () => {
    expect(pick(undefined, 'en')).toBe('');
  });
});
