/**
 * Pure helpers for the seeder, split out so they can be unit tested.
 *
 * `seed.js` itself connects to a database and runs on import, which makes it
 * awkward to test; the decisions it makes do not have to be.
 */

/** Collections whose item counts are worth comparing against the defaults. */
export const COMPARED_COLLECTIONS = ['work', 'reels', 'travelReels', 'services', 'mediaKitMetrics'];

/**
 * Whether the caller asked to overwrite existing content.
 *
 * @param {string[]} argv Arguments after the script name.
 * @returns {boolean}
 */
export const wantsOverwrite = (argv) => argv.includes('--force') || argv.includes('--overwrite');

/**
 * Which collections differ in size between stored content and the defaults.
 *
 * Used to explain *why* a skipped seed matters, instead of a bare
 * "already present" that reads like success.
 *
 * @param {object|null} stored
 * @param {object} defaults
 * @returns {Array<{ field: string, stored: number, defaults: number }>}
 */
export const describeDrift = (stored, defaults) =>
  COMPARED_COLLECTIONS.map((field) => ({
    field,
    stored: Array.isArray(stored?.[field]) ? stored[field].length : 0,
    defaults: Array.isArray(defaults?.[field]) ? defaults[field].length : 0,
  })).filter((entry) => entry.stored !== entry.defaults);
