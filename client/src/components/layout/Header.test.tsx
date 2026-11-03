import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Header } from './Header';
import { I18nProvider } from '../../i18n';

const renderHeader = () =>
  render(
    <I18nProvider initial="en">
      <Header brandName="Jeebhar" mediaKitUrl="/brand/media-kit.pdf" />
    </I18nProvider>
  );

describe('Header', () => {
  it('shows the menu from the brief, then Media Kit, in order', () => {
    renderHeader();
    const nav = screen.getAllByRole('navigation')[0];

    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Home', 'Our Services', 'Our Work', 'Our Reels', 'Contact Us', 'Media Kit']);
  });

  it('opens the media kit in a new tab', () => {
    renderHeader();
    const [link] = screen.getAllByRole('link', { name: 'Media Kit' });

    expect(link).toHaveAttribute('href', '/brand/media-kit.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('translates the menu when German is chosen', async () => {
    renderHeader();

    await userEvent.click(screen.getAllByRole('button', { name: /deutsch/i })[0]);

    expect(screen.getAllByRole('link', { name: 'Leistungen' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Menü' })).toBeInTheDocument();
  });
});
