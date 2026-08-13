import { useCallback, useEffect, useRef, useState } from 'react';

import { saveSiteContent } from '../api/content.api';
import { emptyReelItem, emptyWorkItem } from '../../../models/site-content.model';
import type { ReelItem, SiteContent, WorkItem } from '../../../models/site-content.model';
import { toErrorMessage } from '../../../utils/error';

export interface EditableRow<T> {
  key: string;
  value: T;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseContentEditorResult {
  work: Array<EditableRow<WorkItem>>;
  reels: Array<EditableRow<ReelItem>>;
  state: SaveState;
  feedback: string;
  dirty: boolean;
  updateWork: (key: string, patch: Partial<WorkItem>) => void;
  updateReel: (key: string, patch: Partial<ReelItem>) => void;
  addWork: () => void;
  addReel: () => void;
  removeWork: (key: string) => void;
  removeReel: (key: string) => void;
  save: (token: string) => Promise<SiteContent | null>;
  reset: () => void;
}

let keyCounter = 0;
const nextKey = (prefix: string): string => `${prefix}-${(keyCounter += 1)}`;

const toRows = <T extends { _id?: string }>(items: T[], prefix: string): Array<EditableRow<T>> =>
  items.map((item) => ({ key: item._id ?? nextKey(prefix), value: { ...item } }));

export const useContentEditor = (content: SiteContent | null): UseContentEditorResult => {
  const [work, setWork] = useState<Array<EditableRow<WorkItem>>>([]);
  const [reels, setReels] = useState<Array<EditableRow<ReelItem>>>([]);
  const [state, setState] = useState<SaveState>('idle');
  const [feedback, setFeedback] = useState('');
  const [dirty, setDirty] = useState(false);

  // A successful save sends the new content up to the parent, which passes it
  // straight back down as a fresh `content` object. Without this ref the sync
  // effect below would treat that as externally-loaded content and immediately
  // clear the "Content saved." confirmation the user needs to see.
  const justSavedRef = useRef<SiteContent | null>(null);

  // The signature of the content the draft was last synced from. Comparing
  // values rather than object identity means a caller that rebuilds `content`
  // on every render cannot drive this effect in a loop.
  const syncedSignatureRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setWork(toRows(content?.work ?? [], 'work'));
    setReels(toRows(content?.reels ?? [], 'reel'));
    setDirty(false);
    setState('idle');
    setFeedback('');
  }, [content]);

  // Re-sync the draft only when the editable content has actually changed.
  useEffect(() => {
    const signature = JSON.stringify({ work: content?.work ?? [], reels: content?.reels ?? [] });

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

  const touch = () => {
    setDirty(true);
    setState('idle');
    setFeedback('');
  };

  const updateWork = useCallback((key: string, patch: Partial<WorkItem>) => {
    touch();
    setWork((rows) =>
      rows.map((row) => (row.key === key ? { ...row, value: { ...row.value, ...patch } } : row))
    );
  }, []);

  const updateReel = useCallback((key: string, patch: Partial<ReelItem>) => {
    touch();
    setReels((rows) =>
      rows.map((row) => (row.key === key ? { ...row, value: { ...row.value, ...patch } } : row))
    );
  }, []);

  const addWork = useCallback(() => {
    touch();
    setWork((rows) => [...rows, { key: nextKey('work'), value: emptyWorkItem() }]);
  }, []);

  const addReel = useCallback(() => {
    touch();
    setReels((rows) => [...rows, { key: nextKey('reel'), value: emptyReelItem() }]);
  }, []);

  const removeWork = useCallback((key: string) => {
    touch();
    setWork((rows) => rows.filter((row) => row.key !== key));
  }, []);

  const removeReel = useCallback((key: string) => {
    touch();
    setReels((rows) => rows.filter((row) => row.key !== key));
  }, []);

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

      // Blank rows are dropped rather than rejected — the server requires URLs.
      const payload: SiteContent = {
        ...content,
        work: work.map((row) => row.value).filter((item) => item.title && item.imageUrl),
        reels: reels
          .map((row) => row.value)
          .filter((item) => item.title && item.thumbnailUrl && item.instagramUrl),
      };

      setState('saving');
      setFeedback('');

      try {
        const saved = await saveSiteContent(payload, token.trim());
        justSavedRef.current = saved;
        setWork(toRows(saved.work, 'work'));
        setReels(toRows(saved.reels, 'reel'));
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
    [content, reels, work]
  );

  return {
    work,
    reels,
    state,
    feedback,
    dirty,
    updateWork,
    updateReel,
    addWork,
    addReel,
    removeWork,
    removeReel,
    save,
    reset,
  };
};
