import { Button } from '../ui';
import { scrollToSection } from '../../utils/scroll';
import { useI18n } from '../../i18n';

/** VIEW — above-the-fold pitch and primary call to action. */

interface HeroSectionProps {
  eyebrow: string;
  heading: string;
  subheading: string;
  mediaKitUrl: string;
}

export const HeroSection = ({ eyebrow, heading, subheading, mediaKitUrl }: HeroSectionProps) => {
  const { t } = useI18n();
  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative scroll-mt-24 py-16 md:py-28"
    >
      {/* Decorative brand glow — hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-cyan/10 blur-3xl"
      />

      <div className="relative grid gap-6">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            {eyebrow}
          </p>
        )}

        <h1
          id="home-heading"
          className="max-w-4xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {heading}
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-brand-100">{subheading}</p>

        <div className="mt-2 flex flex-wrap gap-3">
          <Button variant="accent" size="lg" onClick={() => scrollToSection('contact')}>
            {t('hero.cta')}
          </Button>
          <a
            href={mediaKitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-brand-cyan/60 px-6 py-3 font-semibold text-brand-cyan transition hover:bg-brand-cyan/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
          >
            {t('hero.mediaKit')}
          </a>
        </div>
      </div>
    </section>
  );
};
