import { Router } from 'express';
import { handleCreateCategory, handleGetCategories, handleSoftDeleteCategory, handleUpdateCategory } from '../controllers/category.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

const router = Router();

router.post('/', validateRequest(createCategorySchema), handleCreateCategory);
router.get('/', handleGetCategories);
router.put('/:id', validateRequest(updateCategorySchema), handleUpdateCategory);
router.delete('/:id', handleSoftDeleteCategory);

export default router;