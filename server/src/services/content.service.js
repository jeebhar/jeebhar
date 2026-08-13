import { siteContentRepository } from '../repositories/site-content.repository.js';
import { defaultContent } from '../seed/default-content.js';

/**
 * SERVICE — business rules for site content.
 *
 * Encodes the two rules the API depends on: exactly one content document
 * exists, and a first read seeds it from defaults so a fresh database still
 * renders a complete site.
 */
/** Collections the frontend iterates over. Every one must be an array. */
const COLLECTIONS = ['services', 'work', 'reels', 'travelReels', 'mediaKitMetrics'];

/** Scalars added after the first release, so older documents may lack them. */
const SCALAR_DEFAULTS = {
  brandName: 'Jeebhar',
  heroEyebrow: '',
  mediaKitUrl: '/brand/media-kit.pdf',
};

const CONTACT_DEFAULTS = {
  address: '',
  email: '',
  phone: '',
  facebookUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
};

export class ContentService {
  constructor(repository = siteContentRepository, seed = defaultContent) {
    this.repository = repository;
    this.seed = seed;
  }

  /** @returns {Promise<object>} the content document, seeding it if needed. */
  async getContent() {
    const existing = await this.repository.findSingleton();
    const content = existing ?? (await this.repository.create(this.seed));
    return ContentService.complete(content);
  }

  /**
   * Fills in fields a stored document predates.
   *
   * Mongoose applies schema defaults when a document is *created*, not when an
   * existing one is read, so a document written before a field existed comes
   * back without it. A missing collection then reaches the frontend as
   * `undefined` and crashes the render.
   *
   * Normalising here means the API's response shape is a guarantee rather than a
   * reflection of whenever the document happened to be written — so adding a
   * field never needs a database migration.
   *
   * @param {object} content Raw document from the repository.
   * @returns {object} The same content with every documented field present.
   */
  static complete(content) {
    const complete = { ...SCALAR_DEFAULTS, ...content };

    COLLECTIONS.forEach((field) => {
      if (!Array.isArray(complete[field])) {
        complete[field] = [];
      }
    });

    complete.contact = { ...CONTACT_DEFAULTS, ...(content?.contact ?? {}) };

    return complete;
  }

  /**
   * @param {object} payload Already-validated content.
   * @returns {Promise<object>} the stored content.
   */
  async replaceContent(payload) {
    const stored = await this.repository.replaceSingleton(payload);
    return ContentService.complete(stored);
  }
}

export const contentService = new ContentService();
