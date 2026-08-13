import { httpClient } from '../../../services/http-client';
import type { SiteContent } from '../../../models/site-content.model';

/**
 * API — the content endpoints, typed.
 *
 * A thin, named boundary: hooks depend on these functions rather than on URLs
 * and verbs, so an endpoint rename never reaches a component.
 */

export const fetchSiteContent = (signal?: AbortSignal): Promise<SiteContent> =>
  httpClient.get<SiteContent>('/content', { signal });

export const saveSiteContent = (content: SiteContent, adminToken: string): Promise<SiteContent> =>
  httpClient.put<SiteContent>('/content', content, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
