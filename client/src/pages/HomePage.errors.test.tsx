import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HomePage } from './HomePage';
import type { SiteContent } from '../models/site-content.model';

/**
 * Regression test: one failing section must not blank the page.
 *
 * Before the ErrorBoundary wrappers, a throw anywhere in a section unmounted the
 * whole tree and left a white screen. ExperienceSection is mocked to throw so a
 * real render failure is exercised, not a contrived prop.
 */

vi.mock('../components/sections/ExperienceSection', () => ({
  ExperienceSection: () => {
    throw new Error('simulated render failure');
  },
}));

const content = (): SiteContent => ({
  brandName: 'Jeebhar',
  heroEyebrow: 'For restaurants',
  heroHeading: 'Turn every scroll into footfall',
  heroSubheading: 'We help restaurants grow.',
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

describe('HomePage error containment', () => {
  it('degrades the failing section and keeps the rest of the page', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<HomePage content={content()} />);

    expect(screen.getByText('Our Experience could not be displayed.')).toBeInTheDocument();

    // Sections before and after the failure both still render.
    expect(screen.getByRole('heading', { name: 'Our Services' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Our Work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Travel Reels' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
