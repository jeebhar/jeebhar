import { httpClient } from '../../../services/http-client';
import type { SiteContent } from '../../../models/site-content.model';

export const fetchSiteContent = (signal?: AbortSignal): Promise<SiteContent> =>
  httpClient.get<SiteContent>('/content', { signal });

export const saveSiteContent = (content: SiteContent, adminToken: string): Promise<SiteContent> =>
  httpClient.put<SiteContent>('/content', content, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
