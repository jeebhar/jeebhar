import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SocialLinks } from './SocialLinks';

const contact = {
  address: 'Offenbach, Germany',
  email: 'jeebhar410@gmail.com',
  phone: '+49',
  instagramUrl: 'https://www.instagram.com/jeebhar/',
  facebookUrl: 'https://www.facebook.com/jeebhar2.0',
  youtubeUrl: '',
  tiktokUrl: 'https://www.tiktok.com/@jeebhar',
};

describe('SocialLinks', () => {
  it('shows a labelled icon link per configured profile, opening in a new tab', () => {
    render(<SocialLinks contact={contact} />);

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Instagram',
      'Facebook',
      'TikTok',
    ]);
    expect(screen.getByRole('link', { name: 'TikTok' })).toHaveAttribute('target', '_blank');
    expect(links[0].querySelector('svg path')).toHaveAttribute('d');
  });

  it('renders nothing when no profile is set', () => {
    const { container } = render(
      <SocialLinks
        contact={{ ...contact, instagramUrl: '', facebookUrl: '', youtubeUrl: '', tiktokUrl: '' }}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
