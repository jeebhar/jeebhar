import { Router } from 'express';

import contactRoutes from './contact.routes.js';
import contentRoutes from './content.routes.js';
import { getHealth } from '../controllers/health.controller.js';

/**
 * ROUTES — API surface, mounted once by the app.
 *
 * Adding a resource means adding a router here; `app.js` never changes
 * (Open/Closed).
 */
const router = Router();

router.get('/health', getHealth);
router.use('/content', contentRoutes);
router.use('/contact', contactRoutes);

export default router;
