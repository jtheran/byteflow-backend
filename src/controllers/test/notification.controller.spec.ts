import { sendNotificationToAll } from '../../services/notificacion.service';
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/resp.util';

export const handleTestPushNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, message, type } = req.body;

    // Disparamos la push en tiempo real a todos los conectados
    sendNotificationToAll({
      title: title || '🚨 Alerta Global',
      message: message || 'El stock del producto "Café Espresso" está por debajo del límite.',
      type: type || 'warning',
      metadata: { systemCode: 'SYS-STOCK-404' }
    });

    sendSuccess({
      res,
      req,
      action:"",
      module: "",
      statusCode: 200,
      message: '✨ Notificación Push en tiempo real emitida exitosamente por WebSockets a través de Redis.',
      data: {
        user: {
          id: undefined,
          email: 'test@byteforge.com'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};