/**
 * Regions and how a visitor's first region is chosen.
 *
 * Pure functions, no React and no DOM, so the rules are unit-tested directly.
 */

import type { Region } from '../models/site-content.model';

export type { Region };

/** Order of the switch: everything, then the two markets. */
export const REGIONS: readonly Region[] = ['all', 'eu', 'in'] as const;

export const isRegion = (value: unknown): value is Region =>
  typeof value === 'string' && (REGIONS as readonly string[]).includes(value);

interface DetectInput {
  /** The visitor's earlier choice from the switch, if any. */
  stored: string | null;
  /** e.g. "www.jeebhar.in" */
  hostname: string;
  /** Host → region, from jeebhar.config.json (domains.sites[].region). */
  domainRegions: Record<string, string>;
}

/**
 * First match wins:
 *   1. the visitor's own choice (they used the switch before, on this domain)
 *   2. the domain: jeebhar.de → Europe, jeebhar.in → India
 *   3. everything (jeebhar.com, localhost)
 */
export const detectRegion = ({ stored, hostname, domainRegions }: DetectInput): Region => {
  if (isRegion(stored)) return stored;

  const host = hostname.toLowerCase().replace(/^www\./, '');
  const configured = domainRegions[host];
  if (isRegion(configured)) return configured;
  if (host.endsWith('.de')) return 'eu';
  if (host.endsWith('.in')) return 'in';
  return 'all';
};

/**
 * The items to show for a region. Items tagged "all" (or untagged) appear in
 * every region; with "all" selected, everything shows.
 */
export const filterByRegion = <T extends { region?: Region }>(
  items: readonly T[] | null | undefined,
  region: Region
): T[] => {
  const list = Array.isArray(items) ? items : [];
  if (region === 'all') return [...list];
  return list.filter((item) => !item.region || item.region === 'all' || item.region === region);
};
