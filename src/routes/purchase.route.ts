import { Router } from 'express';
import { handleCreatePurchase } from '../controllers/purchase.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createPurchaseSchema } from '../schemas/purchase.schema';
import { checkPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', validateRequest(createPurchaseSchema), handleCreatePurchase);

export default router;