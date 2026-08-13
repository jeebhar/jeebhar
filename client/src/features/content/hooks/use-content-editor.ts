import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { saveSiteContent } from '../api/content.api';
import { emptyReelItem, emptyWorkItem } from '../../../models/site-content.model';
import type { ReelItem, SiteContent, WorkItem } from '../../../models/site-content.model';
import { toErrorMessage } from '../../../utils/error';

/**
 * CONTROLLER (hook) — the admin editor's draft state.
 *
 * Edits are kept local until "Save", then sent with the admin token.
 *
 * The three editable collections (work, food reels, travel reels) are driven by
 * one internal `useEditableList`, so a fourth collection is one more line here
 * rather than another four callbacks on the public interface.
 */

export interface EditableRow<T> {
  key: string;
  value: T;
}

/** The handle a view needs to render and edit one collection. */
export interface EditableList<T> {
  rows: Array<EditableRow<T>>;
  update: (key: string, patch: Partial<T>) => void;
  add: () => void;
  remove: (key: string) => void;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseContentEditorResult {
  work: EditableList<WorkItem>;
  reels: EditableList<ReelItem>;
  travelReels: EditableList<ReelItem>;
  state: SaveState;
  feedback: string;
  dirty: boolean;
  save: (token: string) => Promise<SiteContent | null>;
  reset: () => void;
}

/**
 * Rows are addressed by a stable client key rather than by array index, so
 * React reconciles correctly when a row in the middle is removed.
 */
let keyCounter = 0;
const nextKey = (prefix: string): string => `${prefix}-${(keyCounter += 1)}`;

const toRows = <T extends { _id?: string }>(items: T[], prefix: string): Array<EditableRow<T>> =>
  items.map((item) => ({ key: item._id ?? nextKey(prefix), value: { ...item } }));

interface InternalList<T> extends EditableList<T> {
  /** Replaces the draft rows from a source collection. */
  syncFrom: (items: T[]) => void;
  /** The current draft values, without their client keys. */
  values: T[];
}

/**
 * One editable collection. `onTouch` is called on every mutation so the parent
 * can mark the draft dirty and clear stale save feedback in one place.
 */
const useEditableList = <T extends { _id?: string }>(
  prefix: string,
  makeEmpty: () => T,
  onTouch: () => void
): InternalList<T> => {
  const [rows, setRows] = useState<Array<EditableRow<T>>>([]);

  const syncFrom = useCallback((items: T[]) => setRows(toRows(items, prefix)), [prefix]);

  const update = useCallback(
    (key: string, patch: Partial<T>) => {
      onTouch();
      setRows((current) =>
        current.map((row) =>
          row.key === key ? { ...row, value: { ...row.value, ...patch } } : row
        )
      );
    },
    [onTouch]
  );

  const add = useCallback(() => {
    onTouch();
    setRows((current) => [...current, { key: nextKey(prefix), value: makeEmpty() }]);
  }, [makeEmpty, onTouch, prefix]);

  const remove = useCallback(
    (key: string) => {
      onTouch();
      setRows((current) => current.filter((row) => row.key !== key));
    },
    [onTouch]
  );

  const values = useMemo(() => rows.map((row) => row.value), [rows]);

  return { rows, update, add, remove, syncFrom, values };
};

/** A reel is publishable once it has a title and a link; the cover is optional. */
const isPublishableReel = (reel: ReelItem): boolean =>
  Boolean(reel.title.trim() && reel.instagramUrl.trim());

/** A work card needs both a title and an image to render. */
const isPublishableWork = (item: WorkItem): boolean =>
  Boolean(item.title.trim() && item.imageUrl.trim());

export const useContentEditor = (content: SiteContent | null): UseContentEditorResult => {
  const [state, setState] = useState<SaveState>('idle');
  const [feedback, setFeedback] = useState('');
  const [dirty, setDirty] = useState(false);

  const touch = useCallback(() => {
    setDirty(true);
    setState('idle');
    setFeedback('');
  }, []);

  const work = useEditableList<WorkItem>('work', emptyWorkItem, touch);
  const reels = useEditableList<ReelItem>('reel', emptyReelItem, touch);
  const travelReels = useEditableList<ReelItem>('travel', emptyReelItem, touch);

  // A successful save sends the new content up to the parent, which passes it
  // straight back down as a fresh `content` object. Without this ref the sync
  // effect below would treat that as externally-loaded content and immediately
  // clear the "Content saved." confirmation the user needs to see.
  const justSavedRef = useRef<SiteContent | null>(null);

  // The signature of the content the draft was last synced from. Comparing
  // values rather than object identity means a caller that rebuilds `content`
  // on every render cannot drive this effect in a loop.
  const syncedSignatureRef = useRef<string | null>(null);

  const { syncFrom: syncWork } = work;
  const { syncFrom: syncReels } = reels;
  const { syncFrom: syncTravelReels } = travelReels;

  const reset = useCallback(() => {
    syncWork(content?.work ?? []);
    syncReels(content?.reels ?? []);
    syncTravelReels(content?.travelReels ?? []);
    setDirty(false);
    setState('idle');
    setFeedback('');
  }, [content, syncWork, syncReels, syncTravelReels]);

  // Re-sync the draft only when the editable content has actually changed.
  useEffect(() => {
    const signature = JSON.stringify({
      work: content?.work ?? [],
      reels: content?.reels ?? [],
      travelReels: content?.travelReels ?? [],
    });

    if (signature === syncedSignatureRef.current) {
      return;
    }
    syncedSignatureRef.current = signature;

    // Our own save round-tripping back through the parent — keep the feedback.
    if (content && content === justSavedRef.current) {
      justSavedRef.current = null;
      return;
    }

    reset();
  }, [content, reset]);

  const workValues = work.values;
  const reelValues = reels.values;
  const travelReelValues = travelReels.values;

  const save = useCallback(
    async (token: string): Promise<SiteContent | null> => {
      if (!content) {
        return null;
      }
      if (!token.trim()) {
        setState('error');
        setFeedback('Enter your admin token before saving.');
        return null;
      }

      // Half-filled rows are dropped rather than sent to be rejected.
      const payload: SiteContent = {
        ...content,
        work: workValues.filter(isPublishableWork),
        reels: reelValues.filter(isPublishableReel),
        travelReels: travelReelValues.filter(isPublishableReel),
      };

      setState('saving');
      setFeedback('');

      try {
        const saved = await saveSiteContent(payload, token.trim());
        justSavedRef.current = saved;
        syncWork(saved.work);
        syncReels(saved.reels);
        syncTravelReels(saved.travelReels);
        setDirty(false);
        setState('saved');
        setFeedback('Content saved.');
        return saved;
      } catch (error) {
        setState('error');
        setFeedback(toErrorMessage(error, 'Unable to save content.'));
        return null;
      }
    },
    [content, workValues, reelValues, travelReelValues, syncWork, syncReels, syncTravelReels]
  );

  return { work, reels, travelReels, state, feedback, dirty, save, reset };
};
