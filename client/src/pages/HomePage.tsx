import { ContactSection } from '../components/sections/ContactSection';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { HeroSection } from '../components/sections/HeroSection';
import { ReelsSection } from '../components/sections/ReelsSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { WorkSection } from '../components/sections/WorkSection';
import { resolveMediaKitUrl } from '../utils/content';
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
 */

interface HomePageProps {
  content: SiteContent;
}

export const HomePage = ({ content }: HomePageProps) => (
  <main id="main" className="mx-auto max-w-6xl px-4">
    <ErrorBoundary label="The introduction">
      <HeroSection
        eyebrow={content.heroEyebrow}
        heading={content.heroHeading}
        subheading={content.heroSubheading}
        mediaKitUrl={resolveMediaKitUrl(content.mediaKitUrl)}
      />
    </ErrorBoundary>

    <ErrorBoundary label="Our Services">
      <ServicesSection services={content.services ?? []} />
    </ErrorBoundary>

    <ErrorBoundary label="Our Experience">
      <ExperienceSection metrics={content.mediaKitMetrics ?? []} />
    </ErrorBoundary>

    <ErrorBoundary label="Our Work">
      <WorkSection work={content.work ?? []} />
    </ErrorBoundary>

    {/* Two usages of one component — see ReelsSection. */}
    <ErrorBoundary label="Our Reels">
      <ReelsSection
        id="reels"
        title="Our Reels"
        description="Food vlogs and restaurant ad creatives that earned the scroll-stop."
        reels={content.reels ?? []}
        badge="Food & ads"
      />
    </ErrorBoundary>

    <ErrorBoundary label="Travel Reels">
      <ReelsSection
        id="travel"
        title="Travel Reels"
        description="Destination and travel storytelling, shot and edited in house."
        reels={content.travelReels ?? []}
        badge="Travel"
        emptyMessage="Travel reels are coming soon."
      />
    </ErrorBoundary>

    <ErrorBoundary label="Contact Us">
      <ContactSection contact={content.contact} />
    </ErrorBoundary>
  </main>
);
