import { describe, expect, it } from 'vitest';

import { detectRegion, filterByRegion } from './regions';

const domains = { 'jeebhar.com': 'all', 'jeebhar.de': 'eu', 'jeebhar.in': 'in' };

describe('detectRegion', () => {
  it('starts jeebhar.de in Europe, jeebhar.in in India and jeebhar.com with everything', () => {
    expect(detectRegion({ stored: null, hostname: 'www.jeebhar.de', domainRegions: domains })).toBe(
      'eu'
    );
    expect(detectRegion({ stored: null, hostname: 'jeebhar.in', domainRegions: domains })).toBe(
      'in'
    );
    expect(detectRegion({ stored: null, hostname: 'jeebhar.com', domainRegions: domains })).toBe(
      'all'
    );
  });

  it("prefers the visitor's own choice and ignores a corrupted one", () => {
    expect(detectRegion({ stored: 'in', hostname: 'jeebhar.de', domainRegions: domains })).toBe(
      'in'
    );
    expect(detectRegion({ stored: 'moon', hostname: 'jeebhar.de', domainRegions: domains })).toBe(
      'eu'
    );
  });

  it('works without config: .de is Europe, .in is India, anything else everything', () => {
    expect(detectRegion({ stored: null, hostname: 'jeebhar.de', domainRegions: {} })).toBe('eu');
    expect(detectRegion({ stored: null, hostname: 'jeebhar.in', domainRegions: {} })).toBe('in');
    expect(detectRegion({ stored: null, hostname: 'localhost', domainRegions: {} })).toBe('all');
  });
});

describe('filterByRegion', () => {
  const items = [
    { id: 'eu', region: 'eu' as const },
    { id: 'in', region: 'in' as const },
    { id: 'all', region: 'all' as const },
    { id: 'untagged' },
  ];
  const ids = (list: Array<{ id: string }>) => list.map((item) => item.id);

  it('shows a region plus everything tagged for all regions (or untagged)', () => {
    expect(ids(filterByRegion(items, 'eu'))).toEqual(['eu', 'all', 'untagged']);
    expect(ids(filterByRegion(items, 'in'))).toEqual(['in', 'all', 'untagged']);
  });

  it('shows everything for "all", and tolerates a missing list', () => {
    expect(ids(filterByRegion(items, 'all'))).toEqual(['eu', 'in', 'all', 'untagged']);
    expect(filterByRegion(undefined, 'eu')).toEqual([]);
  });
});
