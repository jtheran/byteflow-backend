import { startVectorCronJob } from '../queues/ai.queue';
import { startStockCronJob } from '../queues/alert.queue';

export const startQueues = async () => {
    await startVectorCronJob();
    await startStockCronJob();
}
