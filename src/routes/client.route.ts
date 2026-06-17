import { Router } from 'express';
import { handleCreateClient, handleFindClient, handleGetClients, handleSoftDeleteClient, handleUpdateClient } from '../controllers/client.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createClientSchema, updateClientSchema } from '../schemas/client.schema';
import { checkPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', validateRequest(createClientSchema), handleCreateClient);
router.get('/', handleGetClients);
router.get('/:identifier', handleFindClient);
router.put('/:id', validateRequest(updateClientSchema), handleUpdateClient);
router.delete('/:id', handleSoftDeleteClient);

export default router;