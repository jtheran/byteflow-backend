import { Router } from 'express';
import { handleCreateClient, handleFindClient, handleGetClients, handleSoftDeleteClient, handleUpdateClient } from '../controllers/client.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createClientSchema, updateClientSchema } from '../schemas/client.schema';

const router = Router();

router.post('/client', validateRequest(createClientSchema), handleCreateClient);
router.get('/client', handleGetClients);
router.get('/client/:identifier', handleFindClient);
router.put('/client/:id', validateRequest(updateClientSchema), handleUpdateClient);
router.delete('/client/:id', handleSoftDeleteClient);

export default router;