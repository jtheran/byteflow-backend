import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import config from '../config/config';
import { createAuditLog } from '../services/audit.service';

export const errorHandler = (
  err: Error | HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // 1. Determinar el Status Code (Por defecto 500 si es un error interno no controlado)
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err.message || 'Ha ocurrido un error interno en el servidor.';

  // 2. AUDITORÍA: Registrar el error en la base de datos (Excepto errores de validación menores 400)
  if (statusCode >= 401) {
    createAuditLog({
      userEmail: 'Unknow',
      action: `ERROR_${statusCode}`,
      module: 'SYSTEM',
      description: `Error detectado en ${req.method}::${req.originalUrl} -> ${message}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode
    });
  }

  // 3. Estructurar la respuesta estándar de la API de ByteFlow
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Solo mostrar el stack trace en entorno de desarrollo por motivos de ciberseguridad
    ...(config.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};