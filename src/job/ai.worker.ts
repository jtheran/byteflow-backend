import { Worker, Job } from 'bullmq';
import { syncDatabaseToQdrant } from '../services/ia-index.service';
import { queueConnection } from '../config/queue.config';

// Conexión compartida de Redis que ya utilizas en ByteFlow

export const initAIVectorWorker = () => {
  const worker = new Worker(
    'ai-vector-queue',
    async (job: Job) => {
      if (job.name === 'sync-pos-vectors') {
        console.log(`[BullMQ] Iniciando tarea automática de indexación RAG: ${job.id}`);
        
        const report = await syncDatabaseToQdrant();
        
        console.log(`[BullMQ] Indexación completada con éxito. Vectores procesados: ${report.indexedCount}`);
        return report;
      }
    },
    { 
      connection: queueConnection,
      concurrency: 1 // Solo un proceso a la vez para cuidar la memoria y el límite de OpenRouter
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ] Error en la indexación automática del Job ${job?.id}:`, err);
  });
};