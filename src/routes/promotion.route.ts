import { Router } from 'express';
import { handleCreatePromotion } from '../controllers/promotion.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createPromotionSchema } from '../schemas/promotion.schema';

const router = Router();

router.post('/', validateRequest(createPromotionSchema), handleCreatePromotion);

export default router;