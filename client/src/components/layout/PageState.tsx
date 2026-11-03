import { Button, Logo, Spinner } from '../ui';
import { useI18n } from '../../i18n';

/**
 * VIEW — full-page loading and error states.
 *
 * Branded rather than blank, so a slow API still looks like the Jeebhar site.
 */

export const PageLoading = () => {
  const { t } = useI18n();
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="grid justify-items-center gap-5">
        <Logo variant="mark" height={72} className="animate-pulse" />
        <div className="flex items-center gap-3 text-brand-100">
          <Spinner />
          <span>{t('page.loading')}</span>
        </div>
      </div>
    </main>
  );
};

interface PageErrorProps {
  message: string;
  onRetry: () => void;
}

export const PageError = ({ message, onRetry }: PageErrorProps) => {
  const { t } = useI18n();
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="grid max-w-md justify-items-center gap-5 text-center">
        <Logo variant="mark" height={64} />
        <h1 className="text-2xl font-bold text-white">{t('page.loadFailed')}</h1>
        <p className="text-brand-200">{message}</p>
        <Button variant="primary" onClick={onRetry}>
          {t('page.retry')}
        </Button>
      </div>
    </main>
  );
};
