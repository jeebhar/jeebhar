import { useEffect, useMemo, useState } from 'react';

import { AdminPage } from '../pages/AdminPage';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { HomePage } from '../pages/HomePage';
import { PageError, PageLoading } from '../components/layout/PageState';
import { resolveMediaKitUrl } from '../utils/content';
import { localizeContent } from '../features/content/localize';
import { useHashRoute } from '../hooks/use-hash-route';
import { useI18n } from '../i18n';
import { useSiteContent } from '../features/content/hooks/use-site-content';
import type { SiteContentDocument } from '../models/site-content.model';

/**
 * Application shell: load content once, then route between the public page and
 * the admin editor.
 *
 * The only stateful decisions here are "which route" and "which load state".
 * Everything else is delegated — data to hooks, presentation to pages.
 *
 * Content arrives in both languages; it is resolved to the visitor's language
 * here, once, so no page or section below has to think about translation.
 */
export const App = () => {
  const { content, status, error, reload } = useSiteContent();
  const [route, navigate] = useHashRoute();
  const { language, t } = useI18n();
  const [current, setCurrent] = useState<SiteContentDocument | null>(null);
  const localized = useMemo(
    () => (current ? localizeContent(current, language) : null),
    [current, language]
  );

  // Mirror loaded content into local state so an admin save updates the public
  // page immediately, with no extra round trip.
  useEffect(() => {
    if (content) {
      setCurrent(content);
    }
  }, [content]);

  if (status === 'loading' && !current) {
    return <PageLoading />;
  }

  if (!current || !localized) {
    return <PageError message={error || 'Unable to load content.'} onRetry={reload} />;
  }

  if (route === 'admin') {
    return <AdminPage content={current} onSaved={setCurrent} onExit={() => navigate('home')} />;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-cyan focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-900"
      >
        {t('nav.skipToContent')}
      </a>

      <Header
        brandName={localized.brandName}
        mediaKitUrl={resolveMediaKitUrl(localized.mediaKitUrl)}
      />
      <HomePage content={localized} />
      <Footer brandName={localized.brandName} contact={localized.contact} />
    </>
  );
};
