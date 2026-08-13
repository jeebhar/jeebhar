import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import apiRoutes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rate-limit.middleware.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // correct client IPs behind nginx / a platform proxy

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.corsOrigins,
      methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
      maxAge: 86_400,
    })
  );
  app.use(express.json({ limit: '256kb' }));

  app.use('/api', apiLimiter, apiRoutes);

  // Order matters: unmatched route -> 404, then the single error formatter.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
