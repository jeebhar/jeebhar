import { useState } from 'react';

import { Button } from '../ui';
import { scrollToSection } from '../../utils/scroll';
import { useI18n } from '../../i18n';

/**
 * VIEW — above-the-fold pitch and primary call to action, on a full-width banner.
 *
 * The photo fills the whole section, edge to edge. It is decorative (empty
 * alt): the heading carries the meaning. A gradient darkens the text side so
 * any photo the owner uploads keeps the text readable, and the whole layer
 * fades out at the bottom into the page background, with no visible edge. If the image is missing
 * or fails, the brand gradient shows instead.
 */

interface HeroSectionProps {
  eyebrow: string;
  heading: string;
  subheading: string;
  mediaKitUrl: string;
  /** Banner behind the text; blank for none. */
  imageUrl?: string;
}

export const HeroSection = ({
  eyebrow,
  heading,
  subheading,
  mediaKitUrl,
  imageUrl,
}: HeroSectionProps) => {
  const { t } = useI18n();
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative isolate flex min-h-[78svh] items-center overflow-hidden"
    >
      {/* Photo + readability gradient, faded out at the bottom into the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-600 via-brand-900 to-transparent [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
      >
        {showImage && (
          <img
            src={imageUrl}
            alt=""
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/70 to-brand-950/25" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:py-28">
        <div className="grid gap-6">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-cyan">
              {eyebrow}
            </p>
          )}

          <h1
            id="home-heading"
            className="max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {heading}
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-brand-100">{subheading}</p>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" onClick={() => scrollToSection('contact')}>
              {t('hero.cta')}
            </Button>
            <a
              href={mediaKitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-brand-cyan/60 bg-brand-950/40 px-6 py-3 font-semibold text-brand-cyan backdrop-blur-sm transition hover:bg-brand-cyan/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
            >
              {t('hero.mediaKit')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
