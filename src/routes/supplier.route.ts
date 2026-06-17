// src/routes/supplier.routes.ts
import { Router } from 'express';
import { handleCreateSupplier, handleGetSuppliers, handleSoftDeleteSupplier, handleUpdateSupplier } from '../controllers/supplier.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/auth.middleware';
import { createSupplierSchema, updateSupplierSchema } from '../schemas/supplier.schema';

const router = Router();

router.post('/', validateRequest(createSupplierSchema), handleCreateSupplier);
router.get('/', handleGetSuppliers);
router.put('/:id', validateRequest(updateSupplierSchema), handleUpdateSupplier);
router.delete('/:id', handleSoftDeleteSupplier);

export default router;