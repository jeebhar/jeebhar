import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { saveSiteContent } from '../api/content.api';
import {
  emptyMetricDoc,
  emptyReelDoc,
  emptyServiceDoc,
  emptyWorkDoc,
} from '../../../models/site-content.model';
import type {
  MetricDoc,
  ReelDoc,
  ServiceDoc,
  SiteContentDocument,
  WorkDoc,
} from '../../../models/site-content.model';
import { ApiError } from '../../../services/http-client';
import { toErrorMessage } from '../../../utils/error';

/**
 * CONTROLLER (hook) — the admin editor's draft of the whole site.
 *
 * Edits are kept local until "Save", then sent with the admin token.
 *
 * The draft has two parts:
 *   - `singles`: one-off fields (brand, hero text, media kit, contact details)
 *   - five lists (services, stats, work, reels, travel reels), all driven by one
 *     internal `useEditableList`, so another list is one more line here.
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

/** Everything that is not a list. */
export type SingleFields = Pick<
  SiteContentDocument,
  'brandName' | 'heroEyebrow' | 'heroHeading' | 'heroSubheading' | 'mediaKitUrl' | 'contact'
>;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface UseContentEditorResult {
  singles: SingleFields;
  updateSingles: (patch: Partial<SingleFields>) => void;
  services: EditableList<ServiceDoc>;
  metrics: EditableList<MetricDoc>;
  work: EditableList<WorkDoc>;
  reels: EditableList<ReelDoc>;
  travelReels: EditableList<ReelDoc>;
  state: SaveState;
  feedback: string;
  dirty: boolean;
  save: (token: string) => Promise<SiteContentDocument | null>;
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

// English is required for anything to be published; German is optional and
// falls back to English on the German page.
const has = (value: string | undefined): boolean => Boolean(value?.trim());

const isPublishableService = (item: ServiceDoc): boolean =>
  has(item.title.en) && has(item.shortDescription.en) && has(item.longDescription.en);

const isPublishableMetric = (item: MetricDoc): boolean => has(item.label.en) && has(item.value);

/** A work card needs both a title and an image to render. */
const isPublishableWork = (item: WorkDoc): boolean => has(item.title.en) && has(item.imageUrl);

/** A reel is publishable once it has a title and a link; the cover is optional. */
const isPublishableReel = (reel: ReelDoc): boolean => has(reel.title.en) && has(reel.instagramUrl);

const singlesOf = (content: SiteContentDocument): SingleFields => ({
  brandName: content.brandName,
  heroEyebrow: content.heroEyebrow,
  heroHeading: content.heroHeading,
  heroSubheading: content.heroSubheading,
  mediaKitUrl: content.mediaKitUrl,
  contact: content.contact,
});

export const useContentEditor = (content: SiteContentDocument): UseContentEditorResult => {
  const [state, setState] = useState<SaveState>('idle');
  const [feedback, setFeedback] = useState('');
  const [dirty, setDirty] = useState(false);
  const [singles, setSingles] = useState<SingleFields>(() => singlesOf(content));

  const touch = useCallback(() => {
    setDirty(true);
    setState('idle');
    setFeedback('');
  }, []);

  const updateSingles = useCallback(
    (patch: Partial<SingleFields>) => {
      touch();
      setSingles((current) => ({ ...current, ...patch }));
    },
    [touch]
  );

  const services = useEditableList<ServiceDoc>('service', emptyServiceDoc, touch);
  const metrics = useEditableList<MetricDoc>('metric', emptyMetricDoc, touch);
  const work = useEditableList<WorkDoc>('work', emptyWorkDoc, touch);
  const reels = useEditableList<ReelDoc>('reel', emptyReelDoc, touch);
  const travelReels = useEditableList<ReelDoc>('travel', emptyReelDoc, touch);

  // A successful save sends the new content up to the parent, which passes it
  // straight back down as a fresh `content` object. Without this ref the sync
  // effect below would treat that as externally-loaded content and immediately
  // clear the "Content saved." confirmation the user needs to see.
  const justSavedRef = useRef<SiteContentDocument | null>(null);

  // The signature of the content the draft was last synced from. Comparing
  // values rather than object identity means a caller that rebuilds `content`
  // on every render cannot drive this effect in a loop.
  const syncedSignatureRef = useRef<string | null>(null);

  const { syncFrom: syncServices } = services;
  const { syncFrom: syncMetrics } = metrics;
  const { syncFrom: syncWork } = work;
  const { syncFrom: syncReels } = reels;
  const { syncFrom: syncTravelReels } = travelReels;

  const loadDraft = useCallback(
    (source: SiteContentDocument) => {
      setSingles(singlesOf(source));
      syncServices(source.services ?? []);
      syncMetrics(source.mediaKitMetrics ?? []);
      syncWork(source.work ?? []);
      syncReels(source.reels ?? []);
      syncTravelReels(source.travelReels ?? []);
    },
    [syncServices, syncMetrics, syncWork, syncReels, syncTravelReels]
  );

  const reset = useCallback(() => {
    loadDraft(content);
    setDirty(false);
    setState('idle');
    setFeedback('');
  }, [content, loadDraft]);

  // Re-sync the draft only when the content has actually changed.
  useEffect(() => {
    const signature = JSON.stringify(content);
    if (signature === syncedSignatureRef.current) {
      return;
    }
    syncedSignatureRef.current = signature;

    // Our own save round-tripping back through the parent — keep the feedback.
    if (content === justSavedRef.current) {
      justSavedRef.current = null;
      return;
    }

    reset();
  }, [content, reset]);

  const serviceValues = services.values;
  const metricValues = metrics.values;
  const workValues = work.values;
  const reelValues = reels.values;
  const travelReelValues = travelReels.values;

  const save = useCallback(
    async (token: string): Promise<SiteContentDocument | null> => {
      if (!token.trim()) {
        setState('error');
        setFeedback('Enter your admin token before saving.');
        return null;
      }

      // Half-filled rows are dropped rather than sent to be rejected.
      const payload: SiteContentDocument = {
        ...content,
        ...singles,
        services: serviceValues.filter(isPublishableService),
        mediaKitMetrics: metricValues.filter(isPublishableMetric),
        work: workValues.filter(isPublishableWork),
        reels: reelValues.filter(isPublishableReel),
        travelReels: travelReelValues.filter(isPublishableReel),
      };

      setState('saving');
      setFeedback('');

      try {
        const saved = await saveSiteContent(payload, token.trim());
        justSavedRef.current = saved;
        loadDraft(saved);
        setDirty(false);
        setState('saved');
        setFeedback('Content saved. The site shows it straight away.');
        return saved;
      } catch (error) {
        setState('error');
        // Name the first rejected field, e.g. "work.2.imageUrl — Enter an https:// URL…".
        const detail = error instanceof ApiError ? error.details?.[0] : undefined;
        const message = toErrorMessage(error, 'Unable to save content.');
        setFeedback(detail ? `${message} ${detail.field} — ${detail.message}` : message);
        return null;
      }
    },
    [
      content,
      singles,
      serviceValues,
      metricValues,
      workValues,
      reelValues,
      travelReelValues,
      loadDraft,
    ]
  );

  return {
    singles,
    updateSingles,
    services,
    metrics,
    work,
    reels,
    travelReels,
    state,
    feedback,
    dirty,
    save,
    reset,
  };
};
