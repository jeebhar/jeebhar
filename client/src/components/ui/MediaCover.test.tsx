import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { MediaCover } from './MediaCover';

const tile = () => screen.getByTestId('media-cover-tile');

describe('MediaCover', () => {
  it('renders the photo over the tile when a source is supplied', () => {
    render(<MediaCover src="/reels/DQWG611DCCr.jpg" title="Food reel 01" />);

    expect(screen.getByRole('img', { name: 'Food reel 01' })).toHaveAttribute(
      'src',
      '/reels/DQWG611DCCr.jpg'
    );
    // The tile stays underneath so a lazy or slow photo never leaves a blank box.
    expect(tile()).toBeInTheDocument();
  });

  it('renders only the tile when there is no source', () => {
    render(<MediaCover src="" title="Travel reel 01" />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(tile()).toBeInTheDocument();
  });

  it('does not print the title on the tile — the card heading already does', () => {
    render(<MediaCover src="" title="Travel reel 01" />);

    expect(screen.queryByText('Travel reel 01')).toBeNull();
  });

  it('drops the photo on a failed load, leaving the tile', () => {
    // This is what makes the drop-in cover convention work: a file that is not
    // there yet 404s and the card degrades instead of showing a broken image.
    render(<MediaCover src="/reels/missing.jpg" title="Food reel 02" />);

    fireEvent.error(screen.getByRole('img', { name: 'Food reel 02' }));

    expect(screen.queryByRole('img')).toBeNull();
    expect(tile()).toBeInTheDocument();
  });

  it('keeps the photo transparent until it loads, then fades it in', () => {
    render(<MediaCover src="/reels/a.jpg" title="Food reel 01" />);

    const image = screen.getByRole('img', { name: 'Food reel 01' });
    expect(image.className).toContain('opacity-0');

    fireEvent.load(image);
    expect(image.className).toContain('opacity-100');
  });

  it('hides the tile from assistive tech, since the card heading already names the item', () => {
    render(<MediaCover src="" title="Travel reel 01" />);

    expect(tile()).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the category badge on the tile', () => {
    render(<MediaCover src="" title="Travel reel 01" badge="Travel" />);

    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('renders landscape work photos without a play affordance', () => {
    const { container } = render(
      <MediaCover
        src="https://images.unsplash.com/photo-x?w=1200"
        title="South Indian"
        aspect="landscape"
        showPlayIcon={false}
      />
    );

    expect(container.firstElementChild?.className).toContain('aspect-[4/3]');
    expect(screen.queryByText('▶')).toBeNull();
  });

  it('falls back for a work photo too, so a stale remote URL never shows a broken image', () => {
    render(
      <MediaCover
        src="https://images.unsplash.com/dead"
        title="Georgian Restaurant"
        aspect="landscape"
        showPlayIcon={false}
      />
    );

    fireEvent.error(screen.getByRole('img', { name: 'Georgian Restaurant' }));

    expect(screen.queryByRole('img')).toBeNull();
    expect(tile()).toBeInTheDocument();
  });

  it('lazy-loads covers so a long rail does not block first paint', () => {
    render(<MediaCover src="/reels/a.jpg" title="Food reel 01" />);

    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });
});
