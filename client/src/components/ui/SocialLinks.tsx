import { siFacebook, siInstagram, siTiktok, siYoutube } from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';
import type { CSSProperties } from 'react';

import type { ContactDetails } from '../../models/site-content.model';

/**
 * VIEW — round icon links to the social profiles.
 *
 * The platform icons come from Simple Icons (CC0), the standard open set of
 * brand marks for "find us on …" links. Each link is labelled with the
 * platform name for screen readers, and opens in a new tab. Profiles without a
 * URL are left out, so there are never dead links.
 */

interface SocialLinksProps {
  contact: ContactDetails;
  /** Icon button size: footer uses `md`, the contact card `sm`. */
  size?: 'sm' | 'md';
  className?: string;
}

const PLATFORMS: ReadonlyArray<{ key: keyof ContactDetails; icon: SimpleIcon }> = [
  { key: 'instagramUrl', icon: siInstagram },
  { key: 'facebookUrl', icon: siFacebook },
  { key: 'youtubeUrl', icon: siYoutube },
  { key: 'tiktokUrl', icon: siTiktok },
];

const SIZE = {
  sm: { button: 'h-10 w-10', icon: 'h-[18px] w-[18px]' },
  md: { button: 'h-12 w-12', icon: 'h-5 w-5' },
};

export const SocialLinks = ({ contact, size = 'md', className = '' }: SocialLinksProps) => {
  const links = PLATFORMS.filter(({ key }) => Boolean(contact[key]));
  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map(({ key, icon }) => (
        <li key={key}>
          <a
            href={contact[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={icon.title}
            title={icon.title}
            className={`grid ${SIZE[size].button} place-items-center rounded-full border border-white/15 bg-white/5 text-brand-100 transition hover:-translate-y-0.5 hover:border-transparent hover:bg-[var(--brand)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan`}
            // Hover fills the circle with the platform's own colour (TikTok's black is
            // lifted slightly so it still shows on the dark page).
            style={
              { '--brand': `#${icon.hex === '000000' ? '1f1f1f' : icon.hex}` } as CSSProperties
            }
          >
            <svg
              viewBox="0 0 24 24"
              className={SIZE[size].icon}
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={icon.path} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
};
