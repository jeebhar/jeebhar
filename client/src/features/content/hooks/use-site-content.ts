import { useCallback, useEffect, useState } from 'react';

import { fetchSiteContent } from '../api/content.api';
import type { SiteContentDocument } from '../../../models/site-content.model';
import { toErrorMessage } from '../../../utils/error';

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

export const useSiteContent = (): UseSiteContentResult => {
  const [content, setContent] = useState<SiteContentDocument | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
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
