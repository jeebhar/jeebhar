import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HomePage } from './HomePage';
import type { SiteContent } from '../models/site-content.model';

/**
 * Regression tests for the "blank site" failure.
 *
 * A content document written before `travelReels` existed arrived with that field
 * `undefined`. `Carousel` read `items.length`, React threw during render, and the
 * entire page unmounted — a white screen.
 *
 * The page must render from a legacy payload, and no single section may be able
 * to take the rest of the page down.
 */

const fullContent = (): SiteContent => ({
  brandName: 'Jeebhar',
  heroEyebrow: 'For restaurants',
  heroHeading: 'Turn every scroll into footfall',
  heroSubheading: 'We help restaurants grow.',
  heroImageUrl: '',
  mediaKitUrl: '/brand/media-kit.pdf',
  services: [{ _id: 's1', title: 'Brand', shortDescription: 'a', longDescription: 'b' }],
  work: [{ _id: 'w1', title: 'South Indian', imageUrl: 'https://x/a.jpg', description: 'd' }],
  reels: [{ _id: 'r1', title: 'Food reel 01', thumbnailUrl: '', instagramUrl: 'https://i/1' }],
  travelReels: [
    { _id: 't1', title: 'Travel reel 01', thumbnailUrl: '', instagramUrl: 'https://i/9' },
  ],
  mediaKitMetrics: [{ _id: 'm1', label: 'Followers', value: '250K+' }],
  contact: {
    address: 'Somewhere',
    email: 'hello@jeebhar.com',
    phone: '+91-90000-00000',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
  },
});

/** Strips fields added after the first release, as a stored document would. */
const legacyContent = () => {
  const content = fullContent() as Partial<SiteContent>;
  delete content.travelReels;
  delete content.heroEyebrow;
  delete content.mediaKitUrl;
  return content as SiteContent;
};

describe('HomePage', () => {
  it('renders every section from complete content', () => {
    render(<HomePage content={fullContent()} />);

    for (const heading of [
      'Our Services',
      'Our Experience',
      'Our Work',
      'Our Reels',
      'Travel Reels',
      'Contact Us',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
  });

  it('renders from a legacy document that has no travelReels', () => {
    render(<HomePage content={legacyContent()} />);

    // The page is intact — this is the case that used to blank the whole site.
    expect(screen.getByRole('heading', { name: 'Our Work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Travel Reels' })).toBeInTheDocument();
    expect(screen.getByText('Travel reels are coming soon.')).toBeInTheDocument();
  });

  it('keeps the media kit link clickable even with no mediaKitUrl stored', () => {
    // A legacy document has no mediaKitUrl. Rendering href={undefined} produced a
    // link that did nothing at all when clicked.
    render(<HomePage content={legacyContent()} />);

    const link = screen.getByRole('link', { name: /view media kit/i });
    expect(link).toHaveAttribute('href', '/brand/media-kit.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders when every collection is missing', () => {
    const bare = {
      brandName: 'Jeebhar',
      heroHeading: 'Heading',
      heroSubheading: 'Sub',
      contact: fullContent().contact,
    } as SiteContent;

    render(<HomePage content={bare} />);

    expect(screen.getByRole('heading', { name: 'Our Work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeInTheDocument();
  });
});
