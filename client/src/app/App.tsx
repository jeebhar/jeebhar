import { useEffect, useState } from 'react';

import { AdminPage } from '../pages/AdminPage';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { HomePage } from '../pages/HomePage';
import { PageError, PageLoading } from '../components/layout/PageState';
import { appConfig } from '../config/app.config';
import { useHashRoute } from '../hooks/use-hash-route';
import { useSiteContent } from '../features/content/hooks/use-site-content';
import type { SiteContent } from '../models/site-content.model';

export const App = () => {
  const { content, status, error, reload } = useSiteContent();
  const [route, navigate] = useHashRoute();
  const [current, setCurrent] = useState<SiteContent | null>(null);

  useEffect(() => {
    if (content) {
      setCurrent(content);
    }
  }, [content]);

  if (status === 'loading' && !current) {
    return <PageLoading />;
  }

  if (!current) {
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
        Skip to content
      </a>

      <Header brandName={current.brandName} mediaKitUrl={current.mediaKitUrl} />
      <HomePage content={current} />
      <Footer
        brandName={current.brandName}
        tagline={appConfig.brand.tagline}
        contact={current.contact}
      />
    </>
  );
};
