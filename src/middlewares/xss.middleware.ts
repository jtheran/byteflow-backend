import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

// Función recursiva para limpiar strings dentro de cualquier objeto o arreglo
const sanitizeData = (data: any): any => {
  if (typeof data === 'string') {
    // Purga cualquier etiqueta <script>, eventos onload, etc.
    return DOMPurify.sanitize(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (data !== null && typeof data === 'object') {
    const cleanObject: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleanObject[key] = sanitizeData(data[key]);
      }
    }
    return cleanObject;
  }
  
  return data;
};

export const xssSanitizer = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) req.body = sanitizeData(req.body);
  if (req.params) req.params = sanitizeData(req.params);
  
  // Para evitar tocar la propiedad protegida de solo lectura 'req.query' directamente,
  // limpiamos sus propiedades internas mutando sus llaves si existen
  if (req.query) {
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        req.query[key] = sanitizeData(req.query[key]);
      }
    }
  }

  next();
};