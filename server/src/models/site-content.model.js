import mongoose from 'mongoose';

/**
 * MODEL — the single editable site-content document.
 *
 * Schemas describe shape and invariants only. No request handling, no business
 * rules: those belong to validators and services respectively.
 */

const { Schema } = mongoose;

const trimmedRequired = (label) => ({
  type: String,
  required: [true, `${label} is required`],
  trim: true,
});

const serviceSchema = new Schema(
  {
    title: trimmedRequired('Service title'),
    shortDescription: trimmedRequired('Service short description'),
    longDescription: trimmedRequired('Service long description'),
  },
  { _id: true }
);

const workSchema = new Schema(
  {
    title: trimmedRequired('Work title'),
    imageUrl: trimmedRequired('Work image URL'),
    description: { type: String, default: '', trim: true },
  },
  { _id: true }
);

const reelSchema = new Schema(
  {
    title: trimmedRequired('Reel title'),
    // Optional: Instagram does not expose cover images to third parties, so a
    // reel with no cover renders a branded tile instead of a broken image.
    thumbnailUrl: { type: String, default: '', trim: true },
    instagramUrl: trimmedRequired('Reel Instagram URL'),
  },
  { _id: true }
);

const metricSchema = new Schema(
  {
    label: trimmedRequired('Metric label'),
    value: trimmedRequired('Metric value'),
  },
  { _id: true }
);

const contactSchema = new Schema(
  {
    address: trimmedRequired('Contact address'),
    email: trimmedRequired('Contact email'),
    phone: trimmedRequired('Contact phone'),
    facebookUrl: { type: String, default: '', trim: true },
    youtubeUrl: { type: String, default: '', trim: true },
    instagramUrl: { type: String, default: '', trim: true },
    tiktokUrl: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const siteContentSchema = new Schema(
  {
    brandName: { type: String, required: true, trim: true, default: 'Jeebhar' },
    heroEyebrow: { type: String, default: '', trim: true },
    heroHeading: trimmedRequired('Hero heading'),
    heroSubheading: trimmedRequired('Hero subheading'),
    mediaKitUrl: { type: String, default: '/brand/media-kit.pdf', trim: true },
    services: { type: [serviceSchema], default: [] },
    work: { type: [workSchema], default: [] },
    /** Food vlogs and restaurant ad creatives. */
    reels: { type: [reelSchema], default: [] },
    /** Travel reels — same shape, shown in its own section. */
    travelReels: { type: [reelSchema], default: [] },
    mediaKitMetrics: { type: [metricSchema], default: [] },
    contact: { type: contactSchema, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
  }
);

export const SiteContent = mongoose.model('SiteContent', siteContentSchema);
