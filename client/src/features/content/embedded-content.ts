import type { SiteContentDocument } from '../../models/site-content.model';

/**
 * Content the server already put into the page.
 *
 * On Bluehost, index.php embeds the site content as
 * `<script id="jeebhar-content" type="application/json">`, so the app can
 * render immediately instead of showing a spinner while it calls /api/content.
 * In development (Vite) there is no such tag and the app fetches as before.
 *
 * Read once, before React replaces the server-rendered markup in #root.
 */
export const readEmbeddedContent = (): SiteContentDocument | null => {
  const element = document.getElementById('jeebhar-content');
  if (!element?.textContent) return null;
  try {
    const parsed: unknown = JSON.parse(element.textContent);
    return parsed && typeof parsed === 'object' ? (parsed as SiteContentDocument) : null;
  } catch {
    return null; // malformed: fall back to the API
  }
};
