import { z } from 'zod';

/** VALIDATOR — the shape of a valid site-content payload. */

const url = z.string().trim().url('Enter a valid URL.');
const optionalUrl = z.union([url, z.literal('')]).default('');

/**
 * An image location: either an absolute http(s) URL or a root-relative path
 * such as `/reels/DQWG611DCCr.jpg`.
 *
 * Relative paths matter because covers and photos can be self-hosted from
 * `client/public` — a plain `url()` check would reject those.
 */
const imageRef = z
  .string()
  .trim()
  .max(500)
  .refine((value) => /^https?:\/\/\S+$/.test(value) || /^\/[^\s]*$/.test(value), {
    message: 'Enter an absolute http(s) URL or a path beginning with "/".',
  });

const optionalImageRef = z.union([imageRef, z.literal('')]).default('');

const serviceSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1).max(120),
  shortDescription: z.string().trim().min(1).max(300),
  longDescription: z.string().trim().min(1).max(2000),
});

const workSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  imageUrl: imageRef,
  description: z.string().trim().max(600).default(''),
});

const reelSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  // Optional: Instagram does not expose cover images to third parties, so the
  // view falls back to a branded tile when this is blank.
  thumbnailUrl: optionalImageRef,
  instagramUrl: url,
});

const metricSchema = z.object({
  _id: z.string().optional(),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(40),
});

const contactDetailsSchema = z.object({
  address: z.string().trim().min(1).max(300),
  email: z.string().trim().email('Enter a valid contact email.'),
  phone: z.string().trim().min(5).max(40),
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
});

export const siteContentSchema = z.object({
  brandName: z.string().trim().min(1).max(80),
  heroEyebrow: z.string().trim().max(160).default(''),
  heroHeading: z.string().trim().min(1).max(300),
  heroSubheading: z.string().trim().min(1).max(600),
  mediaKitUrl: z.string().trim().max(500).default('/brand/media-kit.pdf'),
  services: z.array(serviceSchema).max(24).default([]),
  work: z.array(workSchema).max(60).default([]),
  reels: z.array(reelSchema).max(60).default([]),
  travelReels: z.array(reelSchema).max(60).default([]),
  mediaKitMetrics: z.array(metricSchema).max(12).default([]),
  contact: contactDetailsSchema,
});
