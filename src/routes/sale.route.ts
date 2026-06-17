import { Router } from 'express';
import { handleCreateSale, handleGetSaleDetails } from '../controllers/sale.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createSaleSchema } from '../schemas/sale.schema';

const router = Router();

router.post('/', validateRequest(createSaleSchema), handleCreateSale);
router.get('/:id', handleGetSaleDetails);

export default router;