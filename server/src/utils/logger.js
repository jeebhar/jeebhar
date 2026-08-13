import { env } from '../config/env.js';

/**
 * Minimal levelled logger.
 *
 * Kept behind this module so call sites never touch `console` directly — the
 * implementation can be replaced with pino/winston without touching callers.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const threshold = LEVELS[env.logLevel] ?? LEVELS.info;

const emit = (level, sink, message, meta) => {
  if (LEVELS[level] > threshold || env.isTest) {
    return;
  }

  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  if (meta === undefined) {
    sink(line);
  } else {
    sink(line, meta);
  }
};

export const logger = {
  error: (message, meta) => emit('error', console.error, message, meta),
  warn: (message, meta) => emit('warn', console.warn, message, meta),
  info: (message, meta) => emit('info', console.info, message, meta),
  debug: (message, meta) => emit('debug', console.debug, message, meta),
};
