import { Request, Response, NextFunction } from 'express';
import { addWhatsappToQueue } from '../../queues/wsp.queue';
import { initializeWhatsappSession, getWhatsappQRCode } from '../../services/wsp.service';
import { sendSuccess } from '../../utils/resp.util';

export const handleTestWhatsappSend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, text } = req.body;

    // Encolamos usando la estructura exacta de la API (phone, text)
    await addWhatsappToQueue(phone, text);

    sendSuccess({
      res,
      req,
      action: "TEST_NOTIFY_WSP",
      module: "NOTIFY",
      statusCode: 200,
      message: '🚀 Mensaje de WhatsApp enviado a la cola de Redis de forma exitosa.',
      data: {
        user: { 
          id: undefined,
          email: "test@byteforge.com"
        }
      }
    });
  } catch (error) {
    next(error);
  }
};


export const handleTestWhatsappQR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Sincronizamos la sesión con el UUID real
    await initializeWhatsappSession();

    // 2. Traemos la respuesta del QR desde el contenedor
    const rawQrResponse = await getWhatsappQRCode();

    // 🔍 LOG DE CONTROL: Imprime esto en tu terminal para ver exactamente cómo viene el objeto
    console.log('📦 [OpenWA QR Raw Response]:', rawQrResponse);

    // 3. Extracción inteligente de la cadena Base64
    let qrString = '';

    if (typeof rawQrResponse === 'string') {
      qrString = rawQrResponse;
    } else if (rawQrResponse && typeof rawQrResponse === 'object') {
      // Extraemos la propiedad común que contenga el string (buscamos en qr, data, code o result)
      qrString = rawQrResponse.qr || rawQrResponse.qrCode || rawQrResponse.result || '';
      
      // Si el objeto viene con una estructura anidada extraña, lo convertimos a string si está vacío
      if (!qrString && rawQrResponse.toString) {
        qrString = rawQrResponse.toString();
      }
    }

    if (!qrString) {
      res.status(400).json({ status: 'error', message: 'No se pudo extraer ninguna cadena válida de QR del contenedor.' });
      return;
    }

    // 4. Limpiamos el prefijo de Data URI si está presente
    if (qrString.startsWith('data:')) {
      qrString = qrString.split(',')[1];
    }

    // 5. Convertimos a Buffer de forma segura ahora que garantizamos que es un String
    const imageBuffer = Buffer.from(qrString, 'base64');

    // 6. Respondemos como imagen PNG nativa
    res.type('image/png');
    res.set('Content-Length', imageBuffer.length.toString());
    res.send(imageBuffer);

  } catch (error) {
    next(error);
  }
};

export const handleTestWhatsappMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, mediaType, url, base64, mimetype, filename, caption } = req.body;

    // Bypass de auditoría Express
    (req as any).user = { id: null, email: 'dev-wsp@byteforge.com' };

    // Añadimos el trabajo a la cola de Redis con los flags de multimedia
    await addWhatsappToQueue({
      phone,
      mediaType,
      url,
      base64,
      mimetype,
      filename,
      caption
    });

    sendSuccess({
      res,
      req,
      action: "TEST_NOTIFY_MEDIA  _WSP",
      module: "NOTIFY",
      statusCode: 200,
      message: `🚀 Envío de ${mediaType} inyectado exitosamente en la cola de Redis.`,
      data: {
        user: { 
          id: undefined,
          email: "test@byteforge.com"
        }
      }
    });
  } catch (error) {
    next(error);
  }
};