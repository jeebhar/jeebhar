import { contactService } from '../services/contact.service.js';
import { asyncHandler } from '../utils/async-handler.js';

/** CONTROLLER — HTTP adapter for contact enquiries. */
export class ContactController {
  constructor(service = contactService) {
    this.service = service;

    this.submit = asyncHandler(this.submit.bind(this));
  }

  /** POST /api/contact */
  async submit(req, res) {
    const result = await this.service.submit(req.validated, { sourceIp: req.ip });

    res.status(201).json({
      ok: true,
      message: 'Thanks — your enquiry has been received. We will be in touch shortly.',
      data: { id: result.id, notified: result.notified },
    });
  }
}

export const contactController = new ContactController();
