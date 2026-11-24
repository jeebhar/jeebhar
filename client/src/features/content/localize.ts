import type { Language } from '../../i18n/languages';
import type {
  LocalizedText,
  ReelDoc,
  SiteContent,
  SiteContentDocument,
} from '../../models/site-content.model';

/**
 * Resolves the bilingual document to one language for rendering.
 *
 * Falls back to English when the German text is blank, so the owner can
 * translate gradually and the German page is never full of holes.
 *
 * Also tolerant of a plain string where { en, de } is expected — content saved
 * before translations existed still renders.
 */
export const pick = (
  text: LocalizedText | string | undefined | null,
  language: Language
): string => {
  if (typeof text === 'string') {
    return text;
  }
  const value = text?.[language]?.trim();
  return value ? value : (text?.en ?? '');
};

const reels = (items: ReelDoc[] | undefined, language: Language) =>
  (items ?? []).map((reel) => ({ ...reel, title: pick(reel.title, language) }));

export const localizeContent = (doc: SiteContentDocument, language: Language): SiteContent => ({
  brandName: doc.brandName,
  heroEyebrow: pick(doc.heroEyebrow, language),
  heroHeading: pick(doc.heroHeading, language),
  heroSubheading: pick(doc.heroSubheading, language),
  heroImageUrl: doc.heroImageUrl ?? '',
  mediaKitUrl: doc.mediaKitUrl,
  services: (doc.services ?? []).map((service) => ({
    ...service,
    title: pick(service.title, language),
    shortDescription: pick(service.shortDescription, language),
    longDescription: pick(service.longDescription, language),
  })),
  work: (doc.work ?? []).map((item) => ({
    ...item,
    title: pick(item.title, language),
    description: pick(item.description, language),
  })),
  reels: reels(doc.reels, language),
  travelReels: reels(doc.travelReels, language),
  mediaKitMetrics: (doc.mediaKitMetrics ?? []).map((metric) => ({
    ...metric,
    label: pick(metric.label, language),
  })),
  contact: doc.contact,
});
