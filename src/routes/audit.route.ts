// src/routes/audit.routes.ts
import { Router } from 'express';
import { handleGetAuditLogs } from '../controllers/audit.controller';
import { isAuth, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint ultra-protegido
router.get('/', isAuth, checkPermission('audit:logs'), handleGetAuditLogs);

export default router;