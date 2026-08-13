import { Router } from 'express';

import contactRoutes from './contact.routes.js';
import contentRoutes from './content.routes.js';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', getHealth);
router.use('/content', contentRoutes);
router.use('/contact', contactRoutes);

export default router;
