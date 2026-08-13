import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Mongo connection lifecycle. Nothing else in the app calls `mongoose.connect`,
 * so the transport can be swapped or stubbed in one place.
 */

mongoose.set('strictQuery', true);

export const connectDatabase = async (uri = env.mongoUri) => {
  if (!uri) {
    throw new Error('MONGODB_URI is required to connect to the database.');
  }

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (error) => logger.error('MongoDB error', error));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: !env.isProduction,
  });

  return mongoose.connection;
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
};
