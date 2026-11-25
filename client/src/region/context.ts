import { createContext, useContext } from 'react';

import type { Region } from './regions';

/**
 * The region context and `useRegion()` — apart from the provider component so
 * React fast refresh works (a component file should only export components).
 */
export interface RegionValue {
  region: Region;
  setRegion: (region: Region) => void;
}

/** "Everything" without a provider, so components render in isolation and in tests. */
export const RegionContext = createContext<RegionValue>({
  region: 'all',
  setRegion: () => undefined,
});

export const useRegion = (): RegionValue => useContext(RegionContext);
