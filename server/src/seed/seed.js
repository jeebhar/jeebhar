import { assertEnv } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { defaultContent } from './default-content.js';
import { logger } from '../utils/logger.js';
import { describeDrift, wantsOverwrite } from './seed.helpers.js';
import { siteContentRepository } from '../repositories/site-content.repository.js';

/**
 * Content seeder.
 *
 *   npm run seed          seed only if the collection is empty
 *   npm run seed:force    replace whatever is stored with the current defaults
 *
 * `seed:force` exists as its own script deliberately. `npm run seed -- --force`
 * from the repo root expands to `npm --prefix server run seed --force`, where the
 * outer npm consumes `--force` as one of its own flags and the inner script never
 * receives it — so the seeder would skip while appearing to have been forced.
 */

const force = wantsOverwrite(process.argv.slice(2));

const run = async () => {
  assertEnv();
  await connectDatabase();

  const existing = await siteContentRepository.findSingleton();

  if (!existing) {
    await siteContentRepository.replaceSingleton(defaultContent);
    logger.info('Content seeded from defaults.');
  } else if (force) {
    await siteContentRepository.replaceSingleton(defaultContent);
    logger.info('Content replaced with the current defaults.');
    logger.info(
      `Loaded ${defaultContent.work.length} work items, ${defaultContent.reels.length} reels, ` +
        `${defaultContent.travelReels.length} travel reels.`
    );
  } else {
    // The common trap: someone runs this expecting new content and gets nothing.
    // Say plainly that nothing changed, and exactly how to change it.
    const drift = describeDrift(existing, defaultContent);

    logger.warn('Nothing was written — content already exists in the database.');

    if (drift.length > 0) {
      logger.warn('The stored content differs from the current defaults:');
      drift.forEach(({ field, stored, defaults }) =>
        logger.warn(`  ${field}: ${stored} stored vs ${defaults} in defaults`)
      );
      logger.warn('');
      logger.warn('To replace the stored content with the current defaults, run:');
      logger.warn('    npm run seed:force');
      logger.warn('');
      logger.warn('This overwrites any edits made through /#/admin.');
    } else {
      logger.info('It already matches the current defaults, so there is nothing to do.');
    }
  }

  await disconnectDatabase();
};

run().catch(async (error) => {
  logger.error('Seeding failed', error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
