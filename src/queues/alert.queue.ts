import { Queue } from 'bullmq';
import { queueConnection } from '../config/queue.config';


export const stockAlertQueue = new Queue('stock-alert-queue', {
  connection: queueConnection
});

export const startStockCronJob = async () => {
  const repeatableJobs = await stockAlertQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.name === 'check-stock-hourly') {
      await stockAlertQueue.removeRepeatableByKey(job.key);
    }
  }

  // Programación horaria automática
  await stockAlertQueue.add(
    'check-stock-hourly',
    {}, 
    {
      repeat: {
        pattern: '0 * * * *' // Dispara la tarea exactamente al minuto 0 de cada hora
      },
      removeOnComplete: true,
      removeOnFail: 50
    }
  );

  console.log('[BullMQ] Tarea automatizada de Auditoría de Stock agendada correctamente (Cada hora).');
};