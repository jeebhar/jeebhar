import { Router } from 'express';

import { contactController } from '../controllers/contact.controller.js';
import { contactLimiter } from '../middleware/rate-limit.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { contactSubmissionSchema } from '../validators/contact.validator.js';

/** ROUTES — public contact endpoint, throttled then validated. */
const router = Router();

router.post('/', contactLimiter, validateBody(contactSubmissionSchema), contactController.submit);

export default router;
