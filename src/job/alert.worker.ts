import { Worker, Job } from 'bullmq';
import { verifyAndAlertStock } from '../services/alert.service';
import { queueConnection } from '../config/queue.config';

export const initStockAlertWorker = () => {
  const worker = new Worker(
    'stock-alert-queue',
    async (job: Job) => {
      if (job.name === 'check-stock-hourly') {
        console.log(`[BullMQ] Ejecutando auditoría horaria de inventario: ${job.id}`);
        const result = await verifyAndAlertStock();
        return result;
      }
    },
    { 
      connection: queueConnection,
      concurrency: 1 
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`[BullMQ] Auditoría de stock finalizada. Bajos: ${result.lowStockCount}, Excesos: ${result.overStockCount}`);
  });
};