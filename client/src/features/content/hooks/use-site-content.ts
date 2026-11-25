import { useCallback, useEffect, useState } from 'react';

import { fetchSiteContent } from '../api/content.api';
import type { SiteContentDocument } from '../../../models/site-content.model';
import { toErrorMessage } from '../../../utils/error';
import { readEmbeddedContent } from '../embedded-content';

/**
 * CONTROLLER (hook) — loads site content and exposes its state.
 *
 * All the async/loading/error orchestration lives here so views stay
 * declarative: they receive `content`, `status` and `error` and just render.
 */

export type LoadStatus = 'loading' | 'ready' | 'error';

interface UseSiteContentResult {
  content: SiteContentDocument | null;
  status: LoadStatus;
  error: string;
  reload: () => void;
}

/** Read once per page load: the server embeds the content in the HTML. */
let embedded: SiteContentDocument | null | undefined;
const initialContent = (): SiteContentDocument | null => {
  if (embedded === undefined) embedded = readEmbeddedContent();
  return embedded;
};

export const useSiteContent = (): UseSiteContentResult => {
  const [content, setContent] = useState<SiteContentDocument | null>(initialContent);
  const [status, setStatus] = useState<LoadStatus>(() => (initialContent() ? 'ready' : 'loading'));
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    // Content came with the page: nothing to fetch until someone asks to reload.
    if (reloadToken === 0 && initialContent()) return undefined;

    const controller = new AbortController();
    let active = true;

    setStatus('loading');
    setError('');

    fetchSiteContent(controller.signal)
      .then((loaded) => {
        if (!active) return;
        setContent(loaded);
        setStatus('ready');
      })
      .catch((caught: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(toErrorMessage(caught, 'Unable to load website content.'));
        setStatus('error');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadToken]);

  return { content, status, error, reload };
};
