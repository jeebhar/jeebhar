import { SiteContent } from '../models/site-content.model.js';

export class SiteContentRepository {
  /** @param {import('mongoose').Model} model */
  constructor(model = SiteContent) {
    this.model = model;
  }

  /** @returns {Promise<object|null>} plain object, or null when unseeded. */
  findSingleton() {
    return this.model.findOne().lean().exec();
  }

  /** @returns {Promise<object>} the created document as a plain object. */
  async create(payload) {
    const created = await this.model.create(payload);
    return created.toObject();
  }

  /**
   * Replaces the singleton document, creating it when absent.
   *
   * `findOneAndReplace` rather than `findOneAndUpdate`: Mongoose 8 dropped the
   * `overwrite` option, so an update would be wrapped in `$set` and silently
   * merge — leaving behind fields the caller meant to remove.
   *
   * @returns {Promise<object>}
   */
  replaceSingleton(payload) {
    return this.model
      .findOneAndReplace({}, payload, {
        new: true,
        upsert: true,
        runValidators: true,
        returnDocument: 'after',
      })
      .lean()
      .exec();
  }
}

export const siteContentRepository = new SiteContentRepository();
