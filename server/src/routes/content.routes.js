import { Router } from 'express';

import { contentController } from '../controllers/content.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { siteContentSchema } from '../validators/content.validator.js';

const router = Router();

router.get('/', contentController.getContent);
router.put('/', requireAdmin, validateBody(siteContentSchema), contentController.updateContent);

export default router;
