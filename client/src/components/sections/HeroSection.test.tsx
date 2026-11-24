import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { HeroSection } from './HeroSection';

const props = {
  eyebrow: 'For restaurants and food brands',
  heading: 'Reimagine your restaurant',
  subheading: 'Sub',
  mediaKitUrl: '/brand/media-kit.pdf',
};

const banner = (container: HTMLElement) => container.querySelector('img');

describe('HeroSection', () => {
  it('puts the banner image behind the text, as decoration', () => {
    const { container } = render(<HeroSection {...props} imageUrl="/brand/hero-banner.jpg" />);

    expect(banner(container)).toHaveAttribute('src', '/brand/hero-banner.jpg');
    expect(banner(container)).toHaveAttribute('alt', '');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reimagine');
  });

  it('drops a banner that fails to load, keeping the text', () => {
    const { container } = render(<HeroSection {...props} imageUrl="/missing.jpg" />);

    fireEvent.error(banner(container) as HTMLImageElement);

    expect(banner(container)).toBeNull();
    expect(screen.getByText('For restaurants and food brands')).toBeInTheDocument();
  });

  it('renders without a banner', () => {
    const { container } = render(<HeroSection {...props} imageUrl="" />);
    expect(banner(container)).toBeNull();
  });
});
