import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { checkPermission, isAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(isAuth)

router.post('/chat-rag', aiController.chatRAG);
router.post('/sync-vectors', aiController.syncVectors);

export default router;