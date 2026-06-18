import { Queue } from 'bullmq';
import { queueConnection } from '../config/queue.config';


export const aiVectorQueue = new Queue('ai-vector-queue', {
  connection: queueConnection
});

/**
 * Registra la tarea programada en Redis de manera limpia
 */
export const startVectorCronJob = async () => {
  // Limpiamos tareas repetibles previas con el mismo nombre para evitar duplicados al reiniciar el servidor
  const repeatableJobs = await aiVectorQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.name === 'sync-pos-vectors') {
      await aiVectorQueue.removeRepeatableByKey(job.key);
    }
  }

  // Agregamos la tarea recurrente utilizando un patrón CRON estándar
  await aiVectorQueue.add(
    'sync-pos-vectors',
    {}, // No requiere payload porque mapea todo el inventario de la DB
    {
      repeat: {
        pattern: '0 0 * * *' // Ejecución automatizada: Cada medianoche a las 12:00 AM
        // Si deseas probarlo cada 15 minutos en desarrollo usa: '*/15 * * * *'
      },
      removeOnComplete: true, // Limpia el historial para no saturar Redis
      removeOnFail: 100       // Conserva los últimos 100 fallos para auditoría
    }
  );

  console.log('[BullMQ] Tarea automatizada RAG (Qdrant Sync) agendada correctamente a la medianoche.');
};