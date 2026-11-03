import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useContentEditor } from './use-content-editor';
import type { SiteContentDocument } from '../../../models/site-content.model';

const L = (en: string, de = '') => ({ en, de });

const saveMock = vi.fn();

vi.mock('../api/content.api', () => ({
  saveSiteContent: (...args: unknown[]) => saveMock(...args),
}));

const content = (overrides: Partial<SiteContentDocument> = {}): SiteContentDocument => ({
  brandName: 'Jeebhar',
  heroEyebrow: L(''),
  heroHeading: L('Heading', 'Überschrift'),
  heroSubheading: L('Subheading'),
  mediaKitUrl: '/brand/media-kit.pdf',
  services: [],
  work: [{ _id: 'w1', title: L('South Indian'), imageUrl: 'https://x/a.jpg', description: L('') }],
  reels: [
    {
      _id: 'r1',
      title: L('Food reel 01'),
      thumbnailUrl: '/reels/a.jpg',
      instagramUrl: 'https://i/1',
    },
  ],
  travelReels: [
    { _id: 't1', title: L('Travel reel 01'), thumbnailUrl: '', instagramUrl: 'https://i/9' },
  ],
  mediaKitMetrics: [],
  contact: {
    address: 'a',
    email: 'hello@jeebhar.com',
    phone: '+91-90000-00000',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
  },
  ...overrides,
});

const TOKEN = 'a-valid-looking-admin-token';

beforeEach(() => saveMock.mockReset());
afterEach(() => vi.clearAllMocks());

describe('useContentEditor', () => {
  it('seeds every collection from the content it is given', () => {
    const { result } = renderHook(() => useContentEditor(content()));

    expect(result.current.work.rows).toHaveLength(1);
    expect(result.current.reels.rows).toHaveLength(1);
    expect(result.current.travelReels.rows).toHaveLength(1);
    expect(result.current.work.rows[0].value.title.en).toBe('South Indian');
    expect(result.current.travelReels.rows[0].value.title.en).toBe('Travel reel 01');
    expect(result.current.dirty).toBe(false);
  });

  it('keeps the three collections independent', () => {
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.travelReels.add());

    expect(result.current.travelReels.rows).toHaveLength(2);
    expect(result.current.reels.rows).toHaveLength(1);
    expect(result.current.work.rows).toHaveLength(1);
  });

  it('marks itself dirty on edit and addresses rows by stable key, not index', () => {
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.work.add());
    const addedKey = result.current.work.rows[1].key;

    act(() => result.current.work.update(addedKey, { title: L('Second') }));
    act(() => result.current.work.remove(result.current.work.rows[0].key));

    expect(result.current.dirty).toBe(true);
    expect(result.current.work.rows).toHaveLength(1);
    // The surviving row is the one that was edited, not whatever slid into index 0.
    expect(result.current.work.rows[0].value.title.en).toBe('Second');
  });

  it('refuses to save without a token and does not call the API', async () => {
    const { result } = renderHook(() => useContentEditor(content()));

    await act(async () => {
      await result.current.save('   ');
    });

    expect(saveMock).not.toHaveBeenCalled();
    expect(result.current.state).toBe('error');
    expect(result.current.feedback).toMatch(/admin token/i);
  });

  it('drops half-filled rows rather than sending them to be rejected', async () => {
    saveMock.mockImplementation((payload: SiteContentDocument) => Promise.resolve(payload));
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.work.add()); // blank
    act(() => result.current.reels.add()); // blank
    act(() => result.current.travelReels.add()); // blank

    await act(async () => {
      await result.current.save(TOKEN);
    });

    const [sent] = saveMock.mock.calls[0] as [SiteContentDocument];
    expect(sent.work).toHaveLength(1);
    expect(sent.reels).toHaveLength(1);
    expect(sent.travelReels).toHaveLength(1);
  });

  it('keeps a reel that has no cover image, since covers are optional', async () => {
    saveMock.mockImplementation((payload: SiteContentDocument) => Promise.resolve(payload));
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.reels.add());
    const key = result.current.reels.rows[1].key;
    act(() =>
      result.current.reels.update(key, {
        title: L('No cover yet'),
        instagramUrl: 'https://www.instagram.com/reel/ABC/',
      })
    );

    await act(async () => {
      await result.current.save(TOKEN);
    });

    const [sent] = saveMock.mock.calls[0] as [SiteContentDocument];
    expect(sent.reels).toHaveLength(2);
    expect(sent.reels[1]).toMatchObject({ title: { en: 'No cover yet' }, thumbnailUrl: '' });
  });

  it('keeps the success confirmation when the saved content is passed back in', async () => {
    // Regression test: AdminPage lifts the saved content into App, which passes a
    // new `content` object straight back down. The sync effect must not read that
    // as an external load and wipe the "Content saved." message.
    const saved = content({ heroHeading: L('Saved') });
    saveMock.mockResolvedValue(saved);

    const { result, rerender } = renderHook(({ value }) => useContentEditor(value), {
      initialProps: { value: content() },
    });

    act(() => result.current.work.update(result.current.work.rows[0].key, { title: L('Edited') }));

    await act(async () => {
      await result.current.save(TOKEN);
    });

    expect(result.current.state).toBe('saved');

    // This is what App does: setCurrent(saved) -> new content prop.
    rerender({ value: saved });

    expect(result.current.state).toBe('saved');
    expect(result.current.feedback).toMatch(/^Content saved\./);
    expect(result.current.dirty).toBe(false);
  });

  it('tolerates a caller that rebuilds content on every render', () => {
    // The sync effect compares content by value, not object identity, so a
    // parent that builds a fresh object each render cannot loop it.
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useContentEditor(content());
    });

    expect(result.current.work.rows[0].value.title.en).toBe('South Indian');
    expect(renders).toBeLessThan(10);
  });

  it('re-syncs every collection when different content arrives from outside', () => {
    const { result, rerender } = renderHook(({ value }) => useContentEditor(value), {
      initialProps: { value: content() },
    });

    act(() => result.current.work.update(result.current.work.rows[0].key, { title: L('Edited') }));
    expect(result.current.dirty).toBe(true);

    const external = content({
      work: [{ _id: 'w9', title: L('Reloaded'), imageUrl: 'https://x/b.jpg', description: L('') }],
      travelReels: [
        { _id: 't9', title: L('Travel reloaded'), thumbnailUrl: '', instagramUrl: 'https://i/8' },
      ],
    });
    rerender({ value: external });

    expect(result.current.dirty).toBe(false);
    expect(result.current.work.rows[0].value.title.en).toBe('Reloaded');
    expect(result.current.travelReels.rows[0].value.title.en).toBe('Travel reloaded');
  });

  it('re-syncs when only the travel reels changed', () => {
    // The content signature must cover travelReels too, or an external change to
    // just that collection would be missed.
    const { result, rerender } = renderHook(({ value }) => useContentEditor(value), {
      initialProps: { value: content() },
    });

    rerender({
      value: content({
        travelReels: [
          {
            _id: 't5',
            title: L('Only travel changed'),
            thumbnailUrl: '',
            instagramUrl: 'https://i/7',
          },
        ],
      }),
    });

    expect(result.current.travelReels.rows[0].value.title.en).toBe('Only travel changed');
  });

  it('reports a failed save and leaves the draft intact for a retry', async () => {
    saveMock.mockRejectedValue(new Error('Invalid admin token.'));
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.work.update(result.current.work.rows[0].key, { title: L('Edited') }));

    await act(async () => {
      await result.current.save(TOKEN);
    });

    expect(result.current.state).toBe('error');
    expect(result.current.feedback).toBe('Invalid admin token.');
    expect(result.current.dirty).toBe(true);
    expect(result.current.work.rows[0].value.title.en).toBe('Edited');
  });

  it('discards changes back to the supplied content', () => {
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.work.update(result.current.work.rows[0].key, { title: L('Edited') }));
    act(() => result.current.travelReels.add());
    act(() => result.current.reset());

    expect(result.current.dirty).toBe(false);
    expect(result.current.work.rows[0].value.title.en).toBe('South Indian');
    expect(result.current.travelReels.rows).toHaveLength(1);
  });
  it('edits one-off fields (hero, contact) and saves them with the lists', async () => {
    saveMock.mockImplementation((payload: SiteContentDocument) => Promise.resolve(payload));
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.updateSingles({ heroHeading: L('New heading', 'Neue Überschrift') }));
    expect(result.current.dirty).toBe(true);

    await act(async () => {
      await result.current.save(TOKEN);
    });

    const [sent] = saveMock.mock.calls[0] as [SiteContentDocument];
    expect(sent.heroHeading).toEqual({ en: 'New heading', de: 'Neue Überschrift' });
    expect(sent.contact.email).toBe('hello@jeebhar.com');
  });

  it('publishes a row with English only, and drops one with German only', async () => {
    saveMock.mockImplementation((payload: SiteContentDocument) => Promise.resolve(payload));
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.metrics.add());
    act(() => result.current.metrics.add());
    const [first, second] = result.current.metrics.rows;
    act(() => result.current.metrics.update(first.key, { label: L('Followers'), value: '10K' }));
    act(() => result.current.metrics.update(second.key, { label: L('', 'Nur DE'), value: '5' }));

    await act(async () => {
      await result.current.save(TOKEN);
    });

    const [sent] = saveMock.mock.calls[0] as [SiteContentDocument];
    expect(sent.mediaKitMetrics).toEqual([{ label: { en: 'Followers', de: '' }, value: '10K' }]);
  });
});
