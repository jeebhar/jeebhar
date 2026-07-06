import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true }
  },
  { _id: true }
);

const workSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true }
  },
  { _id: true }
);

const reelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    instagramUrl: { type: String, required: true }
  },
  { _id: true }
);

const metricSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: true }
);

const siteContentSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true, default: "Jeebhar" },
    heroHeading: { type: String, required: true },
    heroSubheading: { type: String, required: true },
    services: { type: [serviceSchema], default: [] },
    work: { type: [workSchema], default: [] },
    reels: { type: [reelSchema], default: [] },
    mediaKitMetrics: { type: [metricSchema], default: [] },
    contact: {
      address: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      facebookUrl: { type: String, required: true },
      youtubeUrl: { type: String, required: true },
      instagramUrl: { type: String, required: true },
      tiktokUrl: { type: String, required: true }
    }
  },
  { timestamps: true }
);

export const SiteContent = mongoose.model("SiteContent", siteContentSchema);
