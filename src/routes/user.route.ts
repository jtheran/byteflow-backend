import { Router } from 'express';
import { handleCreateUser, handleGetUsers, handleSoftDeleteUser, handleUpdateUser } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.post('/', validateRequest(createUserSchema), handleCreateUser);
router.get('/', handleGetUsers);
router.put('/:id', validateRequest(updateUserSchema), handleUpdateUser);
router.delete('/:id', handleSoftDeleteUser);

export default router;