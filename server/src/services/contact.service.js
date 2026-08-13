import { contactSubmissionRepository } from '../repositories/contact-submission.repository.js';
import { createMailer } from './mailer.service.js';
import { logger } from '../utils/logger.js';

/**
 * SERVICE — business rules for contact enquiries.
 *
 * Owns the order of operations (persist first, notify second) and the rule that
 * a failed notification must not fail the user's submission. Knows nothing
 * about HTTP or Mongoose.
 */
export class ContactService {
  constructor(repository = contactSubmissionRepository, mailer = createMailer()) {
    this.repository = repository;
    this.mailer = mailer;
  }

  /**
   * @param {{ name: string, email: string, phone: string, subject: string, body: string }} input
   *   Already-validated payload.
   * @param {{ sourceIp?: string }} [context]
   * @returns {Promise<{ id: string, notified: boolean }>}
   */
  async submit(input, { sourceIp = '' } = {}) {
    const submission = await this.repository.create({ ...input, sourceIp });

    // Persistence is the contract with the user; delivery is best-effort.
    let notified = false;
    try {
      notified = await this.mailer.send(ContactService.buildNotification(submission));
      if (notified) {
        await this.repository.markNotified(submission._id);
      }
    } catch (error) {
      logger.error('Contact notification failed', error);
    }

    return { id: String(submission._id), notified };
  }

  /** @returns {{ subject: string, text: string }} */
  static buildNotification(submission) {
    return {
      subject: `Jeebhar enquiry: ${submission.subject}`,
      text: [
        'New contact submission from the Jeebhar website',
        '',
        `Name:    ${submission.name}`,
        `Email:   ${submission.email}`,
        `Phone:   ${submission.phone}`,
        `Subject: ${submission.subject}`,
        '',
        'Message:',
        submission.body,
      ].join('\n'),
    };
  }
}

export const contactService = new ContactService();
