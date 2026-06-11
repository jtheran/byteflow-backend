import rateLimit from 'express-rate-limit';
import { createAuditLog } from '../services/audit.service';
import { Request, Response } from 'express';

// 1. Configuración de Rate Limit contra Fuerza Bruta y DDoS
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
  max: 100, // Límite de 100 peticiones por IP en este lapso
  standardHeaders: true, // Devuelve información del límite en los headers 'RateLimit-*'
  legacyHeaders: false, // Desactiva los headers antiguos 'X-RateLimit-*'
  handler: (req: Request, res: Response) => {
    // AUDITORÍA: Registramos el bloqueo de la IP sospechosa
    createAuditLog({
      action: 'SECURITY_DDOS_TRIGGER',
      module: 'SECURITY',
      description: `Bloqueo temporal por Rate Limit. IP excedió el límite de peticiones en la ruta: ${req.originalUrl}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: 429
    });

    res.status(429).json({
      status: 'error',
      message: 'Demasiadas solicitudes desde esta IP. Por favor, intente de nuevo en 15 minutos.'
    });
  }
});

// Límite ultra estricto para endpoints críticos como el Login
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // Solo 5 intentos permitidos
  handler: (req: Request, res: Response) => {
    createAuditLog({
      action: 'SECURITY_BRUTE_FORCE_TRIGGER',
      module: 'AUTH',
      description: `Sospecha de Fuerza Bruta. Bloqueo en endpoint de login para la IP: ${req.ip}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: 429
    });

    res.status(429).json({
      status: 'error',
      message: 'Demasiados intentos de inicio de sesión fallidos. Bloqueo temporal de 5 minutos.'
    });
  }
});