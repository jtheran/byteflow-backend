import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { createAuditLog } from '../services/audit.service';

export const validateRequest = (schema: ZodType<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Valida simultáneamente body, query y params según el esquema
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Reasignamos los datos ya limpios y tipados por Zod
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      
      next();
    } catch (error) {
        if (error instanceof ZodError) {
          // 1. Forzamos el casteo de tipo para que TS reconozca los métodos internos sin chistar
          const zodError = error as ZodError;
  
          // AUDITORÍA: Registro de payload malformado
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
            // 2. Usamos .issues que es la propiedad oficial y nativa de ZodError
            errors: zodError.issues.map(err => ({
              field: err.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
              message: err.message
            }))
          });
          return;
        }
  
        res.status(500).json({ status: 'error', message: 'Internal server error en validación.' });
      }
    };
};