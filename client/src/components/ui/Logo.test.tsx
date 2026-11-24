import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Logo } from './Logo';

describe('Logo', () => {
  it('renders the reversed wordmark by default, for the dark site surface', () => {
    render(<Logo />);

    const image = screen.getByRole('img', { name: /jeebhar logo/i });
    expect(image).toHaveAttribute('src', '/brand/jeebhar-logo-light.png');
  });

  it('offers a retina source for the wordmark', () => {
    render(<Logo variant="full" />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'srcset',
      '/brand/jeebhar-logo-light.png 1x, /brand/jeebhar-logo-light@2x.png 2x'
    );
  });

  it('uses the original artwork when the tone is dark', () => {
    render(<Logo tone="dark" />);

    expect(screen.getByRole('img')).toHaveAttribute('src', '/brand/jeebhar-logo.png');
  });

  it('renders the square mark when asked', () => {
    render(<Logo variant="mark" height={64} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/brand/jeebhar-mark-light.png');
    expect(image).toHaveAttribute('width', '64');
    expect(image).toHaveAttribute('height', '64');
  });

  it('omits srcSet for the mark, which has a single source', () => {
    render(<Logo variant="mark" />);

    expect(screen.getByRole('img')).not.toHaveAttribute('srcset');
  });

  it('reserves layout space using the artwork aspect ratio', () => {
    render(<Logo variant="full" height={40} />);

    // 1693 / 567 = 2.986 -> 119px wide at 40px tall.
    expect(screen.getByRole('img')).toHaveAttribute('width', '119');
  });

  it('hides itself from assistive tech when decorative', () => {
    render(<Logo decorative />);

    expect(screen.queryByRole('img')).toBeNull();
  });
});
