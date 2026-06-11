import jwt from 'jsonwebtoken';
import config from '../config/config';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { loginService } from '../services/auth.service';
import { sendOTPService, verifyOTPService } from '../services/otp.service';
import { sendSuccess } from '../utils/resp.util';
import { 
  generateAccessToken, 
  validateRefreshTokenInRedis, 
  revokeRefreshToken 
} from '../services/token.service';

export const handleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: 'error', message: 'Email y contraseña son requeridos' });
      return;
    }

    const result = await loginService(email, password);

    sendSuccess({
      res,
      req,
      action: 'AUTH_LOGIN_SUCCESS',
      module: 'AUTH',
      statusCode: 200,
      message: '¡Bienvenido a ByteFlow!',
      data: result,
    });
  } catch (error) {
    const emailAttempt = req.body.email || 'Desconocido';
      // Si el servicio lanza un error de "Credenciales inválidas", mutamos a un error 401 Unauthorized explícito
    const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
      // Pasamos el error al manejador global usando next()
    next(createError(401, errorMessage, emailAttempt));
  }
};

export const handleRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Verificar la firma del Refresh Token de forma asíncrona
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { id: string };
    
    // Validar si el token coincide con el guardado en Redis (Mitiga robo de tokens viejos)
    const isValid = await validateRefreshTokenInRedis(decoded.id, refreshToken);
    if (!isValid) {
      return next(createError(403, 'Sesión expirada o token revocado. Inicie sesión nuevamente.'));
    }

    // --- AQUÍ RECUPERAMOS LOS DATOS DEL USUARIO DESDE TU DB O SERVICIO ---
    // Simulamos los datos del usuario extraídos para el payload
    const tokenPayload = {
      id: decoded.id,
      email: 'admin@byteflow.com', // Esto vendrá del servicio del usuario real
      role: 'ADMIN',
      permissions: ['sales:create', 'products:manage']
    };

    // Emitimos un nuevo Access Token fresco de corta duración
    const newAccessToken = generateAccessToken(tokenPayload);

    sendSuccess({
      res,
      req,
      action: "AUTH_REFRESHTOKEN_USER",
      module: "AUTH",
      message: 'Token de acceso renovado con éxito.',
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    next(createError(403, 'Token de refresco inválido o corrupto. Acceso denegado.'));
  }
};

export const handleLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // El id del usuario vendrá inyectado por tu middleware de autenticación previa 'isAuth'
    const userId = (req as any).user?.id; 

    if (userId) {
      // Purgamos la sesión de la memoria RAM distribuida de Redis
      await revokeRefreshToken(userId);
    }

    sendSuccess({
      res,
      req,
      action: "AUTH_LOGOUT_USER",
      module: "AUTH",
      message: 'Sesión cerrada de forma segura. Conexión de tokens eliminada.'
    });
  } catch (error) {
    next(createError(500, 'Error al procesar el cierre de sesión.'));
  }
};

export const handleRequestOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Aquí podrías validar primero si el usuario existe en tu DB
    await sendOTPService(email);

    sendSuccess({
      res,
      req,
      action: "GENERATE_OTP_CODE",
      module: "AUTH",
      statusCode: 200,
      message: '🔑 Código de verificación generado y enviado con éxito a tu correo electrónico.',
      data: { 
        id: undefined,
        email
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Verificar OTP y otorgar acceso completo
export const handleVerifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const isOtpValid = await verifyOTPService(email, otp);
    if (!isOtpValid) {
      return next(createError(400, 'El código OTP es inválido, ya fue utilizado o ha expirado.'));
    }

    sendSuccess({
      res,
      req,
      action: "VERIFY_OTP_CODE",
      module: "AUTH",
      statusCode: 200,
      message: '🛡️ Segundo factor verificado con éxito. Acceso concedido.',
      data: { 
        id: undefined,
        email
      }
    });
  } catch (error) {
    next(error);
  }
};