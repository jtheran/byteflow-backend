import { Router } from 'express';
import { handleCreateProduct, handleFindProduct, handleGetProducts, handleToggleProductStatus, handleUpdateProduct } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

const router = Router();

router.post('/product', validateRequest(createProductSchema), handleCreateProduct);
router.get('/product', handleGetProducts);
router.get('/product/:identifier', handleFindProduct);
router.put('/product/:id', validateRequest(updateProductSchema), handleUpdateProduct);
router.patch('/product/:id/status', handleToggleProductStatus); // Activar o desactivar pasando body { isActive: boolean }

export default router;