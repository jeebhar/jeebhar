import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { appConfig } from '../config/app.config';
import { RegionContext } from './context';
import type { RegionValue } from './context';
import { detectRegion } from './regions';
import type { Region } from './regions';

/**
 * Holds which region's work is shown: Europe, India or everything.
 *
 * Starts from the domain (jeebhar.de → Europe, jeebhar.in → India), and
 * remembers the visitor's own choice (best effort — private windows may
 * refuse storage, which is fine).
 */

const STORAGE_KEY = 'jeebhar.region';

const readStored = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

interface RegionProviderProps {
  children: ReactNode;
  /** Forces a region (tests, previews). */
  initial?: Region;
}

export const RegionProvider = ({ children, initial }: RegionProviderProps) => {
  const [region, setRegionState] = useState<Region>(
    () =>
      initial ??
      detectRegion({
        stored: readStored(),
        hostname: window.location.hostname,
        domainRegions: appConfig.domainRegions,
      })
  );

  const setRegion = useCallback((next: Region) => {
    setRegionState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the choice still applies for this visit.
    }
  }, []);

  const value = useMemo<RegionValue>(() => ({ region, setRegion }), [region, setRegion]);
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};
