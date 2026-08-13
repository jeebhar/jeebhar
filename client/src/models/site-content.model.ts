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
  reels: ReelItem[];
  mediaKitMetrics: MediaMetric[];
  contact: ContactDetails;
}

/** A blank editor row — used when the admin adds an item. */
export const emptyWorkItem = (): WorkItem => ({ title: '', imageUrl: '', description: '' });

/** A blank editor row — used when the admin adds a reel. */
export const emptyReelItem = (): ReelItem => ({ title: '', thumbnailUrl: '', instagramUrl: '' });
