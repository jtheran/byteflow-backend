import { Worker, Job } from 'bullmq';
import { queueConnection } from '../config/queue.config';
import { sendWhatsappMessage, sendWhatsappMedia } from '../services/wsp.service';

const whatsappWorker = new Worker(
  'WhatsappQueue',
  async (job: Job) => {
    const { phone, text, mediaType, url, base64, mimetype, filename, caption } = job.data;
    console.log(`⏳ [WA Worker]: Despachando WhatsApp hacia [${phone}]...`);
    if (mediaType && ['image', 'video', 'audio', 'document'].includes(mediaType)) {
      await sendWhatsappMedia(mediaType, {
        phone,
        url,
        base64,
        mimetype,
        filename,
        caption
      });
      console.log(`✅ [WA Worker]: Mensaje Multimedia [${mediaType}] enviado con éxito a [${phone}].`);
      return;
    }else{
      await sendWhatsappMessage({ phone, text });
      console.log(`✅ [WA Worker]: Mensaje enviado con éxito a [${phone}].`);
    }
    
    
  },
  { connection: queueConnection }
);

whatsappWorker.on('failed', (job, err) => {
  console.error(`🚨 [WA Worker Error]: El trabajo ID ${job?.id} falló de forma crítica:`, err.message);
});

export default whatsappWorker;