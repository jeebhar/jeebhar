import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HomePage } from './HomePage';
import { RegionToggle } from '../components/layout/RegionToggle';
import { RegionProvider } from '../region';
import type { Region } from '../region';
import type { SiteContent } from '../models/site-content.model';

const content: SiteContent = {
  brandName: 'Jeebhar',
  heroEyebrow: '',
  heroHeading: 'Heading',
  heroSubheading: 'Sub',
  heroImageUrl: '',
  mediaKitUrl: '/brand/media-kit.pdf',
  services: [],
  work: [
    { _id: 'w1', title: 'Frankfurt momos', imageUrl: '/a.jpg', description: '', region: 'eu' },
    { _id: 'w2', title: 'Mumbai vada pav', imageUrl: '/b.jpg', description: '', region: 'in' },
    { _id: 'w3', title: 'Accor hotels', imageUrl: '/c.jpg', description: '', region: 'all' },
  ],
  reels: [
    {
      _id: 'r1',
      title: 'Stuttgart vegan',
      thumbnailUrl: '',
      instagramUrl: 'https://i/1',
      region: 'eu',
    },
  ],
  travelReels: [],
  mediaKitMetrics: [],
  contact: {
    address: 'Offenbach',
    email: 'a@b.de',
    phone: '+49',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
  },
};

const renderAt = (region: Region) =>
  render(
    <RegionProvider initial={region}>
      <RegionToggle />
      <HomePage content={content} />
    </RegionProvider>
  );

describe('HomePage by region', () => {
  it('Europe shows European work plus work tagged for everywhere', () => {
    renderAt('eu');
    expect(screen.getByText('Frankfurt momos')).toBeInTheDocument();
    expect(screen.getByText('Accor hotels')).toBeInTheDocument();
    expect(screen.queryByText('Mumbai vada pav')).toBeNull();
  });

  it('switching to India swaps the work shown', async () => {
    renderAt('eu');
    await userEvent.click(screen.getByRole('button', { name: 'India' }));
    expect(screen.getByText('Mumbai vada pav')).toBeInTheDocument();
    expect(screen.queryByText('Frankfurt momos')).toBeNull();
    expect(screen.getByRole('button', { name: 'India' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('an empty region offers to show all regions instead of looking broken', async () => {
    renderAt('in');
    expect(screen.queryByText('Stuttgart vegan')).toBeNull();
    expect(screen.getByText('Nothing from India here yet.')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: 'Show all regions' })[0]);
    expect(screen.getByText('Stuttgart vegan')).toBeInTheDocument();
  });

  it('a section that is empty everywhere keeps its normal message', () => {
    renderAt('in');
    expect(screen.getByText('Travel reels are coming soon.')).toBeInTheDocument();
  });
});
