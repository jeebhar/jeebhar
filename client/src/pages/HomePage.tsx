import { ContactSection } from '../components/sections/ContactSection';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { HeroSection } from '../components/sections/HeroSection';
import { ReelsSection } from '../components/sections/ReelsSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { WorkSection } from '../components/sections/WorkSection';
import { resolveMediaKitUrl } from '../utils/content';
import type { ReactNode } from 'react';

import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n';
import type { SiteContent } from '../models/site-content.model';

/**
 * PAGE — composes the public homepage from section views.
 *
 * Content arrives as a prop, so this file is pure composition: no fetching, no
 * state, nothing to read but the running order of the page.
 *
 * Two deliberate defences here:
 *
 *   - Collections are coalesced to `[]`. The API normalises its response, but a
 *     stale cached payload or a hand-edited document should not be able to take
 *     the page down.
 *   - Each section sits in its own ErrorBoundary, so one failure degrades to a
 *     single line of copy instead of a blank page.
 *
 * `content` is already in the visitor's language (see App), so the only
 * translation here is the fixed section copy.
 */

interface HomePageProps {
  content: SiteContent;
}

/** An ErrorBoundary whose fallback copy is in the current language. */
const SectionBoundary = ({ labelKey, children }: { labelKey: MessageKey; children: ReactNode }) => {
  const { t } = useI18n();
  const label = t(labelKey);
  return (
    <ErrorBoundary
      label={label}
      fallback={
        <section className="py-10">
          <p className="rounded-lg border border-white/10 bg-brand-800/40 px-4 py-3 text-sm text-brand-200">
            {t('section.failed', { label })}
          </p>
        </section>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export const HomePage = ({ content }: HomePageProps) => {
  const { t } = useI18n();

  return (
    <main id="main" className="mx-auto max-w-6xl px-4">
      <SectionBoundary labelKey="nav.home">
        <HeroSection
          eyebrow={content.heroEyebrow}
          heading={content.heroHeading}
          subheading={content.heroSubheading}
          mediaKitUrl={resolveMediaKitUrl(content.mediaKitUrl)}
        />
      </SectionBoundary>

      <SectionBoundary labelKey="services.title">
        <ServicesSection services={content.services ?? []} />
      </SectionBoundary>

      <SectionBoundary labelKey="experience.title">
        <ExperienceSection metrics={content.mediaKitMetrics ?? []} />
      </SectionBoundary>

      <SectionBoundary labelKey="work.title">
        <WorkSection work={content.work ?? []} />
      </SectionBoundary>

      {/* Two usages of one component — see ReelsSection. */}
      <SectionBoundary labelKey="reels.title">
        <ReelsSection
          id="reels"
          title={t('reels.title')}
          description={t('reels.description')}
          reels={content.reels ?? []}
          badge={t('reels.badge')}
          emptyMessage={t('reels.empty')}
        />
      </SectionBoundary>

      <SectionBoundary labelKey="travel.title">
        <ReelsSection
          id="travel"
          title={t('travel.title')}
          description={t('travel.description')}
          reels={content.travelReels ?? []}
          badge={t('travel.badge')}
          emptyMessage={t('travel.empty')}
        />
      </SectionBoundary>

      <SectionBoundary labelKey="contact.title">
        <ContactSection contact={content.contact} />
      </SectionBoundary>
    </main>
  );
};
