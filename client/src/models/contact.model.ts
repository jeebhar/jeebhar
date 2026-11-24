/** MODEL — the contact enquiry the public form submits. */

import type { MessageKey } from '../i18n/messages';

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
}

export type ContactField = keyof ContactPayload;

/** Field-level messages, keyed by the field they belong to (display text). */
export type ContactErrors = Partial<Record<ContactField, string>>;

/** Field-level message keys, translated at render time. */
export type ContactErrorKeys = Partial<Record<ContactField, MessageKey>>;

export const emptyContactPayload = (): ContactPayload => ({
  name: '',
  email: '',
  phone: '',
  subject: '',
  body: '',
});
