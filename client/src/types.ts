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
  heroHeading: string;
  heroSubheading: string;
  services: ServiceItem[];
  work: WorkItem[];
  reels: ReelItem[];
  mediaKitMetrics: MediaMetric[];
  contact: ContactDetails;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
}
