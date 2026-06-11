import { Queue } from 'bullmq';
import { queueConnection } from '../config/queue.config';

interface IEmailJobData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

// Inicializamos la cola de correos vinculada a Redis
export const emailQueue = new Queue<IEmailJobData>('EmailQueue', {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3, // Si falla el envío (ej: caída del servidor SMTP), reintenta hasta 3 veces
    backoff: {
      type: 'exponential',
      delay: 5000, // Espera 5s antes del primer reintento, luego 10s, 20s...
    },
    removeOnComplete: true, // Borra el trabajo de Redis si terminó con éxito para no saturar memoria
    removeOnFail: false,    // Mantiene los fallidos en Redis para poder auditarlos/revisarlos
  },
});

// Función limpia para añadir correos a la cola
export const addEmailToQueue = async (data: IEmailJobData): Promise<void> => {
  try {
    // El primer parámetro es el nombre del trabajo, el segundo son los datos reales
    await emailQueue.add(`send-${data.to}-${Date.now()}`, data);
  } catch (error) {
    console.error('🚨 Error al encolar el correo electrónico:', error);
  }
};