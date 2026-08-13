/** MODEL — the contact enquiry the public form submits. */

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
}

export type ContactField = keyof ContactPayload;

/** Field-level messages, keyed by the field they belong to. */
export type ContactErrors = Partial<Record<ContactField, string>>;

export const emptyContactPayload = (): ContactPayload => ({
  name: '',
  email: '',
  phone: '',
  subject: '',
  body: '',
});
