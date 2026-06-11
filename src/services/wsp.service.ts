// src/services/whatsapp.service.ts
import { openWaClient } from '../config/wsp.config';
import config from '../config/config';

interface ISendWhatsappPayload {
  phone: string; // Formato internacional ej: "573001234567"
  text: string;
}

interface ISendMediaPayload {
  phone: string;
  url?: string;        // Opción 1: URL de un servidor (S3, Cloudinary, etc.)
  base64?: string;     // Opción 2: String en base64 del archivo
  mimetype: string;    // Ej: "image/jpeg", "video/mp4", "application/pdf", "audio/mp3"
  filename: string;    // Ej: "factura_1024.pdf"
  caption?: string;    // Texto acompañante opcional (útil en imágenes/videos)
}

let REAL_WHATSAPP_SESSION_ID: string | null = null;
/**
 * 1. Inicializa o crea la sesión del Bot en el contenedor
 */
export const initializeWhatsappSession = async (): Promise<string|null> => {
  try {
    console.log(`🤖 [OpenWA]: Solicitando creación de sesión para [${config.wsp.SESSION_ID}]...`);
    
    // Primero registramos la sesión en el cluster del contenedor
    const resp = await openWaClient.post('/sessions', { 
      name: config.wsp.SESSION_ID,
    });
    
    REAL_WHATSAPP_SESSION_ID = resp.data?.id || resp.data?.sessionId;
    console.log(`✨ [OpenWA]: Sesión creada. ID Real asignado: [${REAL_WHATSAPP_SESSION_ID}]`);
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 409 || error.response?.data?.message?.includes('already exists')) {
      console.log(`ℹ️ [OpenWA]: La sesión [${config.wsp.SESSION_ID}] ya existe. Recuperando ID activo...`);
      
      // PASO CORRECTOR: Si ya existe, consultamos el listado de sesiones del contenedor para buscar su ID real
      const sessionsListResponse = await openWaClient.get('/sessions');
      const existingSession = sessionsListResponse.data?.find((s: any) => s.name === config.wsp.SESSION_ID);
      
      // Si la encuentra en la lista, guardamos su ID, si no, por defecto usamos el name
      REAL_WHATSAPP_SESSION_ID = existingSession?.id || existingSession?.sessionId || config.wsp.SESSION_ID;
      console.log(`🎯 [OpenWA]: ID Real recuperado del cluster: [${REAL_WHATSAPP_SESSION_ID}]`);
    } else {
      console.error('🚨 [OpenWA Session Error]:', error.response?.data || error.message);
      throw error;
    }
  }

  try {
    // PASO 2: Una vez creada o confirmada la sesión, le damos la orden de arrancar el navegador Chromium
    console.log(`⏳ [OpenWA]: Levantando el proceso de WhatsApp Web para [${config.wsp.SESSION_ID}]...`);
    await openWaClient.post(`/sessions/${REAL_WHATSAPP_SESSION_ID}/start`);
    console.log(`🚀 [OpenWA]: Proceso de inicialización completado con éxito.`);
  } catch (error: any) {
    // Si ya está corriendo, el start podría fallar con un código de aviso, lo manejamos limpiamente
    console.log(`ℹ️ [OpenWA Start Note]: El navegador ya está respondiendo o inicializándose.`);
  }
  return REAL_WHATSAPP_SESSION_ID;
};

/**
 * 2. Obtener el QR Code (Retorna el stream, string o buffer según lo envíe el contenedor)
 * Ideal para consumirlo desde un endpoint y pintarlo en el Panel de Administración del POS
 */
export const getWhatsappQRCode = async (): Promise<any> => {
  try {
    // Si no tenemos el ID real en memoria, corremos la inicialización primero para obtenerlo
    const sessionId = await ensureSessionId();

    console.log(`📸 [OpenWA]: Solicitando QR para la sesión ID: [${sessionId}]...`);
    const response = await openWaClient.get(`/sessions/${sessionId}/qr`);
    return response.data; 
  } catch (error: any) {
    console.error('🚨 [OpenWA QR Error]:', error.response?.data || error.message);
    throw new Error('El contenedor no pudo retornar el QR.');
  }
};

/**
 * 3. Enviar Mensaje de Texto Plano (Consumido por el Worker asíncrono de BullMQ)
 */
export const sendWhatsappMessage = async ({ phone, text }: ISendWhatsappPayload): Promise<void> => {
  try {
    // PASO 1: Si el servidor se reinició y la variable en memoria está vacía,
    // recuperamos el UUID real del contenedor antes de hacer el POST
    
    const sessionId = await ensureSessionId();
    // PASO 2: Limpieza estricta del formato del número de teléfono
    // Removemos espacios, guiones o el símbolo '+' que a veces se cuelan desde el cliente
    let cleanPhone = phone.replace(/[\s\+\-]/g, '');
    
    // Aseguramos que termine con el sufijo @c.us exigido por el protocolo de WhatsApp Web
    const formattedChatId = cleanPhone.includes('@c.us') ? cleanPhone : `${cleanPhone}@c.us`;

    console.log(`⏳ [OpenWA]: Despachando HTTP POST a /sessions/${sessionId}/messages/send-text`);
    console.log(`📦 [OpenWA Payload]:`, { chatId: formattedChatId, text });

    // PASO 3: Ejecutamos la petición con la estructura exacta que pide OpenWA
    await openWaClient.post(`/sessions/${sessionId}/messages/send-text`, {
      chatId: formattedChatId,
      text
    });

    console.log(`✅ [OpenWA]: Mensaje enviado correctamente de forma nativa.`);
  } catch (error: any) {
    console.error(`🚨 [OpenWA Send Error Detalle]:`, error.response?.data || error.message);
    throw new Error('El contenedor OpenWA rechazó el despacho del mensaje.');
  }
};

const ensureSessionId = async (): Promise<string|null> => {
  if (!REAL_WHATSAPP_SESSION_ID) {
    console.log('ℹ️ [OpenWA]: ID de sesión ausente en memoria. Sincronizando cluster...');
    const sessionName = config.wsp.SESSION_ID;
    const sessionsListResponse = await openWaClient.get<any[]>('/sessions');
    const sessions = sessionsListResponse.data;

    const existingSession = Array.isArray(sessions)
      ? sessions.find((s: any) => s.name === sessionName)
      : null;

    REAL_WHATSAPP_SESSION_ID = existingSession?.id || sessionName;
  }
  return REAL_WHATSAPP_SESSION_ID;
};

export const sendWhatsappMedia = async (
  type: 'image' | 'video' | 'audio' | 'document',
  payload: ISendMediaPayload
): Promise<void> => {
  try {
    const sessionId = await ensureSessionId();

    // Limpieza y formateo del JID
    const cleanPhone = payload.phone.replace(/[\s\+\-]/g, '');
    const formattedChatId = cleanPhone.endsWith('@c.us') ? cleanPhone : `${cleanPhone}@c.us`;

    // Estructuramos el Request Body tal cual lo pide el Swagger de OpenWA
    const requestBody = {
      chatId: formattedChatId,
      url: payload.url || null,
      base64: payload.base64 || null,
      mimetype: payload.mimetype,
      filename: payload.filename,
      caption: payload.caption || ''
    };

    console.log(`⏳ [OpenWA]: Despachando archivo [${type}] hacia ${formattedChatId}...`);

    // Apuntamos al endpoint dinámico correspondiente: /sessions/{id}/messages/send-{image|video|audio|document}
    await openWaClient.post(`/sessions/${sessionId}/messages/send-${type}`, requestBody);

    console.log(`✅ [OpenWA]: Archivo [${type}] enviado exitosamente.`);
  } catch (error: any) {
    console.error(`🚨 [OpenWA Media Error - send-${type}]:`, error.response?.data || error.message);
    throw new Error(`El contenedor OpenWA rechazó el envío del archivo tipo ${type}.`);
  }
};