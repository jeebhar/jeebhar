import { useState } from 'react';

import { Button } from '../ui';
import { scrollToSection } from '../../utils/scroll';
import { useI18n } from '../../i18n';

/**
 * VIEW — above-the-fold pitch and primary call to action, on a banner image.
 *
 * The banner is decorative (empty alt): the heading carries the meaning. On
 * wide screens it fills the right ~2/3 and fades in from the left, so the text
 * sits on a calm background; on phones it fills the card under a stronger
 * gradient. Either way any photo the owner uploads keeps the text readable.
 * If the image is missing or fails, the brand gradient shows instead.
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
    <section id="home" aria-labelledby="home-heading" className="scroll-mt-24 pt-6 md:pt-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600 via-brand-900 to-brand-950 px-6 py-16 sm:px-10 md:px-14 md:py-28">
        {showImage && (
          <img
            src={imageUrl}
            alt=""
            decoding="async"
            onError={() => setImageFailed(true)}
            className="absolute inset-y-0 right-0 h-full w-full object-cover object-right md:w-[50%] md:[mask-image:linear-gradient(to_right,transparent,black_35%)]"
          />
        )}

        {/* Readability layer between photo and text. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/85 to-brand-950/65 md:bg-gradient-to-r md:from-brand-950/90 md:via-brand-950/55 md:to-transparent"
        />

        <div className="relative grid gap-6">
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
