// src/routes/auth.routes.ts
import { Router } from 'express';
import { handleLogin, handleLogout, handleRefreshToken } from '../controllers/auth.controller';
import { isAuth, checkPermission } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { loginLimiter } from '../middlewares/security.middleware';
import { LoginSchema, RefreshTokenSchema } from '../schemas/auth.schema';

const router = Router();

// Ruta pública
router.post('/login', loginLimiter, validateRequest(LoginSchema), handleLogin);

router.post('/refresh-token', validateRequest(RefreshTokenSchema), handleRefreshToken);

router.post('/logout', isAuth, handleLogout);

// Ruta Protegida de ejemplo: Solo accesible si estás logueado AND tienes el permiso 'sales:void' (o eres ADMIN)
router.get('/test-secure', isAuth, checkPermission('sales:void'), (req, res) => {
  res.json({
    status: 'success',
    message: '¡Pasaste los filtros de ciberseguridad! Tienes acceso a operaciones críticas.',
    userData: req.user,
  });
});

export default router;