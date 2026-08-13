import { Router } from 'express';

import { contentController } from '../controllers/content.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { siteContentSchema } from '../validators/content.validator.js';

/**
 * ROUTES — the request pipeline for site content.
 *
 * Reads are public; writes pass the admin guard and then the schema, so the
 * controller can never receive an unauthenticated or malformed payload.
 */
const router = Router();

router.get('/', contentController.getContent);
router.put('/', requireAdmin, validateBody(siteContentSchema), contentController.updateContent);

export default router;
