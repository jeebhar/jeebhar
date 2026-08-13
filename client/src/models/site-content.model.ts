/**
 * MODEL — the shape of the data the app renders.
 *
 * These types are the contract between the API and every view. Components take
 * them as props and hold no shape knowledge of their own, so a change here is
 * caught by the compiler everywhere it matters.
 */

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
   * parties, so this is either a self-hosted path under `client/public` or
   * blank — in which case the view renders a branded tile instead.
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

/** A blank editor row — used when the admin adds an item. */
export const emptyWorkItem = (): WorkItem => ({ title: '', imageUrl: '', description: '' });

/** A blank editor row — used when the admin adds a reel. */
export const emptyReelItem = (): ReelItem => ({ title: '', thumbnailUrl: '', instagramUrl: '' });
