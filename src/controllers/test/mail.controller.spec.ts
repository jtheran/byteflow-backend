import { Request, Response, NextFunction } from 'express';
import { addEmailToQueue } from '../../queues/email.queue';
import { sendSuccess } from '../../utils/resp.util';
import createError from 'http-errors';

export const handleTestEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Encolamos el correo usando la plantilla 'security-login-alert' que ya tenemos configurada
    await addEmailToQueue({
      to: email,
      subject: '🧪 ByteFlow POS - Prueba de Sistema de Colas',
      template: 'security-login-alert',
      context: {
        name: 'Desarrollador ByteForge',
        date: new Date().toLocaleString(),
        userAgent: req.headers['user-agent'] || 'Postman/Testing',
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    // Respondemos de inmediato al cliente
    sendSuccess({
      res,
      req,
      action: "TEST SEND EMAIL",
      module: "MAIL",
      statusCode: 200,
      message: '🚀 Correo de prueba encolado exitosamente en BullMQ. Revisa tu terminal y tu trampa de correos.',
      data: {
        user: {
          id: '00000000000',
          email: 'test@byteforge.com'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};