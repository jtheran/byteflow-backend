// src/queues/whatsapp.queue.ts
import { Queue } from 'bullmq';
import { queueConnection } from '../config/queue.config';

export const whatsappQueue = new Queue('WhatsappQueue', {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3, // Si WhatsApp falla, reintenta hasta 3 veces
    backoff: { type: 'exponential', delay: 5000 } // Espera 5s, luego 10s...
  }
});

// Interfaz interna para definir la flexibilidad del payload admitido en Redis
interface IWhatsappJobData {
  phone: string;
  text?: string;
  message?: string; // Compatibilidad por si se envía bajo este nombre
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  url?: string;
  base64?: string;
  mimetype?: string;
  filename?: string;
  caption?: string;
}

/**
 * Agrega una tarea de WhatsApp a la cola de BullMQ.
 * Soporta firmas flexibles para texto plano o payloads complejos estructurados.
 */
export const addWhatsappToQueue = async (
  firstParam: string | IWhatsappJobData,
  textFallback?: string
) => {
  // CASO 1: Firma tradicional de texto plano -> addWhatsappToQueue("57300...", "Hola mundo")
  if (typeof firstParam === 'string') {
    await whatsappQueue.add('send:message', {
      phone: firstParam,
      text: textFallback || ''
    });
    return;
  }

  // CASO 2: Objeto estructurado (Multimedia / Avanzado) -> addWhatsappToQueue({ phone, mediaType, ... })
  const jobName = firstParam.mediaType ? `send:${firstParam.mediaType}` : 'send:message';
  await whatsappQueue.add(jobName, firstParam);
};