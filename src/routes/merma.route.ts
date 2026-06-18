import { Router } from 'express';
import { handleCreateAdjustment, handleGetExpiredAlerts } from '../controllers/merma.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createAdjustmentSchema } from '../schemas/merma.schema';

const router = Router();

router.post('/', validateRequest(createAdjustmentSchema), handleCreateAdjustment);
router.get('/expired-alerts', handleGetExpiredAlerts);

export default router;