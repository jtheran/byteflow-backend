// src/config/helmet.config.ts
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

// 1. Configuración de cabeceras de seguridad base
export const helmetMiddleware = () => {
  return helmet({
    contentSecurityPolicy: false, // Permitir estilos de Swagger UI
    hidePoweredBy: false, // Lo manejamos manualmente abajo
  });
};

// 2. Middleware de Ofuscación (Falsa Bandera para engañar scanners)
export const obfuscateHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Powered-By', 'PHP/8.3.4'); 
  res.setHeader('Server', 'Apache/2.4.41 (Ubuntu)');
  next();
};