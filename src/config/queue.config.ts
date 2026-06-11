import { ConnectionOptions } from 'bullmq';
import config from './config';

// Reutilizamos las variables de entorno de Redis
const redisUrl = new URL(config.REDIS_URL);

export const queueConnection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
};