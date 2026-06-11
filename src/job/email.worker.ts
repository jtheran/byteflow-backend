import { Worker, Job } from 'bullmq';
import { queueConnection } from '../config/queue.config';
import { sendMailService } from '../services/mail.service';

// Creamos el Worker
const emailWorker = new Worker(
  'EmailQueue',
  async (job: Job) => {
    const { to, subject, template, context } = job.data;
    
    console.log(`⏳ [Worker]: Procesando envío de email a [${to}] en segundo plano...`);

    await sendMailService({ to, subject, template, context });

    console.log(`✅ [Worker]: Email con asunto "${subject}" enviado con éxito a [${to}].`);
  },
  { connection: queueConnection }
);

// Escuchadores de eventos para monitoreo y logs de infraestructura
emailWorker.on('completed', (job) => {
  console.log(`🎉 [Queue Success]: El trabajo con ID ${job.id} ha finalizado correctamente.`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`🚨 [Queue Error]: El trabajo con ID ${job?.id} falló de forma crítica:`, err.message);
});

export default emailWorker;