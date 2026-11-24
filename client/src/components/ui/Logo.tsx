import { appConfig } from '../../config/app.config';

/**
 * VIEW — the Jeebhar logo.
 *
 * Two axes, both driven by the surface it sits on:
 *
 *   variant  'full' = wordmark lockup, 'mark' = circular icon alone
 *   tone     'light' = reversed artwork for dark surfaces (the site default),
 *            'dark'  = original artwork, for light surfaces and print
 *
 * Every use of the logo goes through here, so swapping the artwork or adding a
 * tone is a change to this file alone.
 */

interface LogoProps {
  variant?: 'full' | 'mark';
  tone?: 'light' | 'dark';
  /** Rendered height in pixels; width follows the artwork's aspect ratio. */
  height?: number;
  className?: string;
  /** Decorative when the brand name is already announced next to it. */
  decorative?: boolean;
}

// Intrinsic aspect ratios of the source artwork. Declared so width/height are
// always set and the logo never causes a layout shift while it loads.
const FULL_RATIO = 1693 / 567;
const MARK_RATIO = 1;

export const Logo = ({
  variant = 'full',
  tone = 'light',
  height = 40,
  className = '',
  decorative = false,
}: LogoProps) => {
  const { logo } = appConfig.brand;
  const isFull = variant === 'full';

  const source = isFull ? logo[tone].full : logo[tone].mark;
  const retina = isFull ? logo[tone].fullRetina : undefined;

  const width = Math.round(height * (isFull ? FULL_RATIO : MARK_RATIO));

  return (
    <img
      src={source}
      srcSet={retina ? `${source} 1x, ${retina} 2x` : undefined}
      width={width}
      height={height}
      alt={decorative ? '' : `${appConfig.brand.name} logo`}
      aria-hidden={decorative || undefined}
      className={`block select-none ${className}`}
      style={{ height, width }}
      decoding="async"
    />
  );
};
