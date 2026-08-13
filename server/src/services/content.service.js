import { siteContentRepository } from '../repositories/site-content.repository.js';
import { defaultContent } from '../seed/default-content.js';

export class ContentService {
  constructor(repository = siteContentRepository, seed = defaultContent) {
    this.repository = repository;
    this.seed = seed;
  }

  /** @returns {Promise<object>} the content document, seeding it if needed. */
  async getContent() {
    const existing = await this.repository.findSingleton();
    return existing ?? this.repository.create(this.seed);
  }

  /**
   * @param {object} payload Already-validated content.
   * @returns {Promise<object>} the stored content.
   */
  replaceContent(payload) {
    return this.repository.replaceSingleton(payload);
  }
}

export const contentService = new ContentService();
