import { Request, Response, NextFunction } from 'express';
import { processRAGChat } from '../services/ia-rag.service';
import { syncDatabaseToQdrant } from '../services/ia-index.service';

// Nota: Asumimos que manejas funciones globales de respuesta como sendSuccess en tu arquitectura de controladores
export const aiController = {
  /**
   * Maneja la interacción por chat RAG con el modelo analítico
   */
  chatRAG: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          statusCode: 400, 
          message: 'El mensaje es requerido en el cuerpo de la petición.' 
        });
      }

      const reply = await processRAGChat(message);

      // Si utilizas tu helper estandarizado, luciría como: sendSuccess(res, { reply }, "Respuesta generada con éxito");
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Respuesta analítica generada con éxito por la IA.',
        data: { reply }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gatilla de forma manual o programada la sincronización hacia Qdrant
   */
  syncVectors: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await syncDatabaseToQdrant();

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Sincronización y vectorización de modelos POS completada.',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
};