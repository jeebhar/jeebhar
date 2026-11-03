import { httpClient } from '../../../services/http-client';
import type { SiteContentDocument } from '../../../models/site-content.model';

/**
 * API — the content endpoints, typed.
 *
 * A thin, named boundary: hooks depend on these functions rather than on URLs
 * and verbs, so an endpoint rename never reaches a component.
 */

/** Both languages; the page resolves one with `localizeContent()`. */
export const fetchSiteContent = (signal?: AbortSignal): Promise<SiteContentDocument> =>
  httpClient.get<SiteContentDocument>('/content', { signal });

/**
 * The token goes in both headers: some shared hosts (Bluehost included) strip
 * `Authorization` before PHP sees it, but never a custom header.
 */
export const adminHeaders = (adminToken: string): Record<string, string> => ({
  Authorization: `Bearer ${adminToken}`,
  'X-Admin-Token': adminToken,
});

export const saveSiteContent = (
  content: SiteContentDocument,
  adminToken: string
): Promise<SiteContentDocument> =>
  httpClient.put<SiteContentDocument>('/content', content, { headers: adminHeaders(adminToken) });
