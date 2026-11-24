import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LanguageToggle } from './LanguageToggle';
import { I18nProvider, useI18n } from '../../i18n';

const Probe = () => {
  const { t } = useI18n();
  return <p>{t('nav.services')}</p>;
};

describe('LanguageToggle', () => {
  it('switches all interface text and marks the active language', async () => {
    render(
      <I18nProvider initial="en">
        <LanguageToggle />
        <Probe />
      </I18nProvider>
    );

    expect(screen.getByText('Our Services')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /english/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await userEvent.click(screen.getByRole('button', { name: /deutsch/i }));

    expect(screen.getByText('Leistungen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deutsch/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(document.documentElement.lang).toBe('de');
  });

  it('remembers the choice for the next visit', async () => {
    render(
      <I18nProvider initial="en">
        <LanguageToggle />
      </I18nProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: /deutsch/i }));

    expect(window.localStorage.getItem('jeebhar.language')).toBe('de');
  });
});
