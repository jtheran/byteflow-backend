import { Router } from 'express';
import { handleCreateProduct, handleFindProduct, handleGetProducts, handleToggleProductStatus, handleUpdateProduct } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

const router = Router();

router.post('/', validateRequest(createProductSchema), handleCreateProduct);
router.get('/', handleGetProducts);
router.get('/:identifier', handleFindProduct);
router.put('/:id', validateRequest(updateProductSchema), handleUpdateProduct);
router.patch('/:id/status', handleToggleProductStatus); // Activar o desactivar pasando body { isActive: boolean }

export default router;