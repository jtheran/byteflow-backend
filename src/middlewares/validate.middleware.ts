// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod'; 
import { createAuditLog } from '../services/audit.service';

export const validateRequest = (schema: ZodType<any,any,any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validamos el payload con Zod
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // 2. Reasignación segura de BODY (Evita romper referencias)
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      
      // 3. Reasignación segura de QUERY llave por llave (Sorteando el read-only getter de Express)
      if (parsed.query) {
        // Limpiamos las llaves viejas que no pasaron el filtro de Zod
        for (const key in req.query) {
          if (!Object.prototype.hasOwnProperty.call(parsed.query, key)) {
            delete req.query[key];
          }
        }
        // Inyectamos los valores limpios y formateados por Zod
        for (const key in parsed.query) {
          if (Object.prototype.hasOwnProperty.call(parsed.query, key)) {
            req.query[key] = parsed.query[key];
          }
        }
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;

        createAuditLog({
          action: 'SECURITY_BAD_REQUEST',
          module: 'VALIDATION',
          description: `Payload inválido rechazado en ${req.originalUrl}. Errores: ${JSON.stringify(zodError.issues)}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          statusCode: 400
        });

        res.status(400).json({
          status: 'error',
          message: 'Error de validación en los datos enviados.',
          errors: zodError.issues.map(err => ({
            field: err.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
            message: err.message
          }))
        });
        return;
      }

      // Si cae aquí, imprimimos el error real en la consola del desarrollador para saber qué falló
      console.error('🚨 Error crítico inesperado en el middleware de validación:', error);

      res.status(500).json({ 
        status: 'error', 
        message: 'Internal server error en validación.',
        ...(process.env.NODE_ENV !== 'production' && { detail: error instanceof Error ? error.message : error })
      });
    }
  };
};