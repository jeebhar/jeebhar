import { createApp } from './app.js';
import { assertEnv, env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const start = async () => {
  assertEnv();
  await connectDatabase();

  const server = createApp().listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Do not hang forever on in-flight connections.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => void shutdown(signal));
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason);
  });
};

start().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
