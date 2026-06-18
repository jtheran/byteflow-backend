import { Router } from 'express';
import { handleCloseSession, handleGetCurrentStatus, handleOpenSession } from '../controllers/session.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { openSessionSchema, closeSessionSchema } from '../schemas/session.schema';

const router = Router();

router.get('/current', handleGetCurrentStatus);
router.post('/open', validateRequest(openSessionSchema), handleOpenSession);
router.post('/close', validateRequest(closeSessionSchema), handleCloseSession);

export default router;