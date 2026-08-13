import { httpClient } from '../../../services/http-client';
import type { ContactPayload } from '../../../models/contact.model';

/** API — the public contact endpoint, typed. */

interface ContactResult {
  id: string;
  notified: boolean;
}

export const submitContactEnquiry = (payload: ContactPayload): Promise<ContactResult> =>
  httpClient.post<ContactResult>('/contact', payload);
