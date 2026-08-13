import nodemailer from 'nodemailer';

import { env, isMailConfigured } from '../config/env.js';
import { logger } from '../utils/logger.js';

/** @typedef {{ send: (message: { subject: string, text: string }) => Promise<boolean> }} Mailer */

/** @implements {Mailer} */
export class SmtpMailer {
  constructor(config = env.mail, transportFactory = nodemailer.createTransport) {
    this.config = config;
    this.transporter = transportFactory({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });
  }

  async send({ subject, text }) {
    await this.transporter.sendMail({
      from: this.config.from,
      to: this.config.to,
      subject,
      text,
    });
    return true;
  }
}

/** @implements {Mailer} */
export class NoopMailer {
  async send({ subject }) {
    logger.warn(`SMTP not configured — skipped notification "${subject}"`);
    return false;
  }
}

/** @returns {Mailer} */
export const createMailer = () => (isMailConfigured() ? new SmtpMailer() : new NoopMailer());
