/**
 * MODEL — the shape of the data the app renders.
 *
 * Two layers, on purpose:
 *
 *   SiteContentDocument   what the API stores and the editor edits.
 *                         Translatable text is { en, de }.
 *   SiteContent           what the page renders: the document resolved to ONE
 *                         language by `localizeContent()`. Plain strings only.
 *
 * Section components only ever see SiteContent, so they know nothing about
 * languages — switching language changes their props, not their code.
 */

import type { Language } from '../i18n/languages';

/** A piece of text the owner writes in both languages. German may be blank. */
export type LocalizedText = Record<Language, string>;

/** `T` with the listed keys turned into LocalizedText. */
type Localized<T, K extends keyof T> = Omit<T, K> & { [P in K]: LocalizedText };

// ---------------------------------------------------------------------------
// View model — one language, what components render
// ---------------------------------------------------------------------------

export interface ServiceItem {
  _id?: string;
  title: string;
  shortDescription: string;
  longDescription: string;
}

export interface WorkItem {
  _id?: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface ReelItem {
  _id?: string;
  title: string;
  /**
   * Optional cover image. Instagram does not expose reel covers to third
   * parties, so this is either an uploaded image or blank — in which case the
   * view renders a branded tile instead.
   */
  thumbnailUrl: string;
  instagramUrl: string;
}

export interface MediaMetric {
  _id?: string;
  label: string;
  value: string;
}

export interface ContactDetails {
  address: string;
  email: string;
  phone: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

export interface SiteContent {
  brandName: string;
  heroEyebrow: string;
  heroHeading: string;
  heroSubheading: string;
  /** Banner behind the hero text. Same image in both languages. */
  heroImageUrl: string;
  mediaKitUrl: string;
  services: ServiceItem[];
  work: WorkItem[];
  /** Food vlogs and restaurant ad creatives. */
  reels: ReelItem[];
  /** Travel reels — same shape, rendered as its own section. */
  travelReels: ReelItem[];
  mediaKitMetrics: MediaMetric[];
  contact: ContactDetails;
}

// ---------------------------------------------------------------------------
// Document model — both languages, what the API stores and the editor edits
// ---------------------------------------------------------------------------

export type ServiceDoc = Localized<ServiceItem, 'title' | 'shortDescription' | 'longDescription'>;
export type WorkDoc = Localized<WorkItem, 'title' | 'description'>;
export type ReelDoc = Localized<ReelItem, 'title'>;
export type MetricDoc = Localized<MediaMetric, 'label'>;

export interface SiteContentDocument {
  brandName: string;
  heroEyebrow: LocalizedText;
  heroHeading: LocalizedText;
  heroSubheading: LocalizedText;
  heroImageUrl: string;
  /** Search engines: page title and meta description. Not shown on the page. */
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  mediaKitUrl: string;
  services: ServiceDoc[];
  work: WorkDoc[];
  reels: ReelDoc[];
  travelReels: ReelDoc[];
  mediaKitMetrics: MetricDoc[];
  contact: ContactDetails;
}

export const emptyText = (): LocalizedText => ({ en: '', de: '' });

/** Blank editor rows — used when the admin clicks "Add …". */
export const emptyServiceDoc = (): ServiceDoc => ({
  title: emptyText(),
  shortDescription: emptyText(),
  longDescription: emptyText(),
});
export const emptyWorkDoc = (): WorkDoc => ({
  title: emptyText(),
  imageUrl: '',
  description: emptyText(),
});
export const emptyReelDoc = (): ReelDoc => ({
  title: emptyText(),
  thumbnailUrl: '',
  instagramUrl: '',
});
export const emptyMetricDoc = (): MetricDoc => ({ label: emptyText(), value: '' });
