import { assertEnv } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { defaultContent } from './default-content.js';
import { logger } from '../utils/logger.js';
import { siteContentRepository } from '../repositories/site-content.repository.js';

const force = process.argv.includes('--force');

const run = async () => {
  assertEnv();
  await connectDatabase();

  const existing = await siteContentRepository.findSingleton();

  if (existing && !force) {
    logger.info('Content already present — nothing to do. Re-run with --force to overwrite.');
  } else {
    await siteContentRepository.replaceSingleton(defaultContent);
    logger.info(existing ? 'Content overwritten from defaults.' : 'Content seeded from defaults.');
  }

  await disconnectDatabase();
};

run().catch((error) => {
  logger.error('Seeding failed', error);
  process.exit(1);
});
