import { Router } from 'express';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { whatsappQueue } from '../queues/wsp.queue';
import { emailQueue } from '../queues/email.queue';

const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const router = Router();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// 2. Creamos el tablero pasando la cola envuelta en el adaptador
createBullBoard({
  queues: [new BullMQAdapter(whatsappQueue), new BullMQAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});

// 3. Montamos el router gráfico
router.use('/queues', serverAdapter.getRouter());

export default router;