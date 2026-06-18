import { initAIVectorWorker } from '../job/ai.worker';
import { initStockAlertWorker } from '../job/alert.worker';

export const startWorkers = () => {
    initAIVectorWorker();
    initStockAlertWorker();
};