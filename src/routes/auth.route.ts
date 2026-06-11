// src/routes/auth.routes.ts
import { Router } from 'express';
import { handleLogin, handleLogout, handleRefreshToken, handleRequestOTP, handleVerifyOTP } from '../controllers/auth.controller';
import { isAuth, checkPermission } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { loginLimiter } from '../middlewares/security.middleware';
import { LoginSchema, RefreshTokenSchema, VerifyOTPSchema } from '../schemas/auth.schema';

const router = Router();

// Ruta pública
router.post('/login', loginLimiter, validateRequest(LoginSchema), handleLogin);

router.post('/refresh-token', validateRequest(RefreshTokenSchema), handleRefreshToken);

router.post('/logout', isAuth, handleLogout);

router.post('/otp/request', loginLimiter, handleRequestOTP);

router.post('/otp/verify', loginLimiter, validateRequest(VerifyOTPSchema), handleVerifyOTP);

export default router;