import { ContactSubmission } from '../models/contact-submission.model.js';

export class ContactSubmissionRepository {
  /** @param {import('mongoose').Model} model */
  constructor(model = ContactSubmission) {
    this.model = model;
  }

  async create(payload) {
    const created = await this.model.create(payload);
    return created.toObject();
  }

  markNotified(id) {
    return this.model.findByIdAndUpdate(id, { notified: true }, { new: true }).lean().exec();
  }

  findRecent(limit = 50) {
    return this.model.find().sort({ createdAt: -1 }).limit(limit).lean().exec();
  }
}

export const contactSubmissionRepository = new ContactSubmissionRepository();
