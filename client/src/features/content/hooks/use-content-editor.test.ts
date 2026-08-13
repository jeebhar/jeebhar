import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useContentEditor } from './use-content-editor';
import type { SiteContent } from '../../../models/site-content.model';

const saveMock = vi.fn();

vi.mock('../api/content.api', () => ({
  saveSiteContent: (...args: unknown[]) => saveMock(...args),
}));

const content = (overrides: Partial<SiteContent> = {}): SiteContent => ({
  brandName: 'Jeebhar',
  heroEyebrow: '',
  heroHeading: 'Heading',
  heroSubheading: 'Subheading',
  mediaKitUrl: '/brand/jeebhar.pdf',
  services: [],
  work: [{ _id: 'w1', title: 'Existing', imageUrl: 'https://x/a.jpg', description: '' }],
  reels: [],
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
  it('seeds its draft rows from the content it is given', () => {
    const { result } = renderHook(() => useContentEditor(content()));

    expect(result.current.work).toHaveLength(1);
    expect(result.current.work[0].value.title).toBe('Existing');
    expect(result.current.dirty).toBe(false);
  });

  it('marks itself dirty on edit and addresses rows by stable key, not index', () => {
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.addWork());
    const addedKey = result.current.work[1].key;

    act(() => result.current.updateWork(addedKey, { title: 'Second' }));
    act(() => result.current.removeWork(result.current.work[0].key));

    expect(result.current.dirty).toBe(true);
    expect(result.current.work).toHaveLength(1);
    // The surviving row is the one that was edited, not whatever slid into index 0.
    expect(result.current.work[0].value.title).toBe('Second');
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

  it('drops incomplete rows rather than sending them to be rejected', async () => {
    saveMock.mockImplementation((payload: SiteContent) => Promise.resolve(payload));
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.addWork()); // left entirely blank

    await act(async () => {
      await result.current.save(TOKEN);
    });

    const [sent] = saveMock.mock.calls[0] as [SiteContent];
    expect(sent.work).toHaveLength(1);
    expect(sent.work[0].title).toBe('Existing');
  });

  it('keeps the success confirmation when the saved content is passed back in', async () => {
    // Regression test: AdminPage lifts the saved content into App, which passes a
    // new `content` object straight back down. The sync effect must not read that
    // as an external load and wipe the "Content saved." message.
    const saved = content({ heroHeading: 'Saved' });
    saveMock.mockResolvedValue(saved);

    const { result, rerender } = renderHook(({ value }) => useContentEditor(value), {
      initialProps: { value: content() },
    });

    act(() => result.current.updateWork(result.current.work[0].key, { title: 'Edited' }));

    await act(async () => {
      await result.current.save(TOKEN);
    });

    expect(result.current.state).toBe('saved');

    // This is what App does: setCurrent(saved) -> new content prop.
    rerender({ value: saved });

    expect(result.current.state).toBe('saved');
    expect(result.current.feedback).toBe('Content saved.');
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

    expect(result.current.work[0].value.title).toBe('Existing');
    expect(renders).toBeLessThan(10);
  });

  it('re-syncs the draft when different content arrives from outside', () => {
    const { result, rerender } = renderHook(({ value }) => useContentEditor(value), {
      initialProps: { value: content() },
    });

    act(() => result.current.updateWork(result.current.work[0].key, { title: 'Edited' }));
    expect(result.current.dirty).toBe(true);

    const external = content({
      work: [{ _id: 'w9', title: 'Reloaded', imageUrl: 'https://x/b.jpg', description: '' }],
    });
    rerender({ value: external });

    expect(result.current.dirty).toBe(false);
    expect(result.current.work[0].value.title).toBe('Reloaded');
  });

  it('reports a failed save and leaves the draft intact for a retry', async () => {
    saveMock.mockRejectedValue(new Error('Invalid admin token.'));
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.updateWork(result.current.work[0].key, { title: 'Edited' }));

    await act(async () => {
      await result.current.save(TOKEN);
    });

    expect(result.current.state).toBe('error');
    expect(result.current.feedback).toBe('Invalid admin token.');
    expect(result.current.dirty).toBe(true);
    expect(result.current.work[0].value.title).toBe('Edited');
  });

  it('discards changes back to the supplied content', () => {
    const { result } = renderHook(() => useContentEditor(content()));

    act(() => result.current.updateWork(result.current.work[0].key, { title: 'Edited' }));
    act(() => result.current.reset());

    expect(result.current.dirty).toBe(false);
    expect(result.current.work[0].value.title).toBe('Existing');
  });
});
