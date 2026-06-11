import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { IPayloadJWT } from '../types';
import { createAuditLog } from '../services/audit.service'; // <--- Importamos el servicio de auditoría

export const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // AUDITORÍA: Intento de acceso sin token
    createAuditLog({
      action: 'ACCESS_DENIED_NO_TOKEN',
      module: 'SECURITY',
      description: `Intento de acceso no autenticado a la ruta: ${req.originalUrl}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: 401
    });

    res.status(401).json({ status: 'error', message: 'Acceso denegado.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as IPayloadJWT;
    req.user = decoded;
    next();
  } catch (error) {
    // AUDITORÍA: Token manipulado o expirado
    createAuditLog({
      action: 'ACCESS_DENIED_INVALID_TOKEN',
      module: 'SECURITY',
      description: `Intento de acceso con token inválido o expirado a la ruta: ${req.originalUrl}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: 401
    });

    res.status(401).json({ status: 'error', message: 'Token inválido.' });
  }
};

export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(500).json({ status: 'error', message: 'Contexto no inicializado.' });
      return;
    }

    const { permissions, role, id, email } = req.user;

    if (role === 'ADMIN') return next();

    const hasAccess = permissions.includes(requiredPermission);

    if (!hasAccess) {
      // AUDITORÍA: El usuario está logueado pero NO tiene el permiso necesario
      createAuditLog({
        userId: id,
        userEmail: email,
        action: 'PERMISSION_DENIED',
        module: 'SECURITY',
        description: `Usuario intentó ejecutar la acción sin el permiso requerido: [${requiredPermission}] en la ruta ${req.originalUrl}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        statusCode: 403
      });

      res.status(403).json({ status: 'error', message: 'Acceso prohibido. Permisos insuficientes.' });
      return;
    }
    
    next();
  };
};