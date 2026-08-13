import mongoose from 'mongoose';

import { env } from '../config/env.js';

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/** CONTROLLER — liveness/readiness probe used by Docker and CI. */
export const getHealth = (_req, res) => {
  const dbState = DB_STATES[mongoose.connection.readyState] ?? 'unknown';
  const healthy = dbState === 'connected';

  res.status(healthy ? 200 : 503).json({
    ok: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      environment: env.nodeEnv,
      database: dbState,
      uptimeSeconds: Math.round(process.uptime()),
    },
  });
};
