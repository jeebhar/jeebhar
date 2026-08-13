import { ContactSection } from '../components/sections/ContactSection';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { HeroSection } from '../components/sections/HeroSection';
import { ReelsSection } from '../components/sections/ReelsSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { WorkSection } from '../components/sections/WorkSection';
import type { SiteContent } from '../models/site-content.model';

interface HomePageProps {
  content: SiteContent;
}

export const HomePage = ({ content }: HomePageProps) => (
  <main id="main" className="mx-auto max-w-6xl px-4">
    <HeroSection
      eyebrow={content.heroEyebrow}
      heading={content.heroHeading}
      subheading={content.heroSubheading}
      mediaKitUrl={content.mediaKitUrl}
    />
    <ServicesSection services={content.services} />
    <ExperienceSection metrics={content.mediaKitMetrics} />
    <WorkSection work={content.work} />
    <ReelsSection reels={content.reels} />
    <ContactSection contact={content.contact} />
  </main>
);
