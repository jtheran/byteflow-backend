import Redis from 'ioredis';
import config from './config';

const redisClient = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on('connect', () => {
  console.log('🛑 [Redis]: Conectado exitosamente al motor en memoria.');
});

redisClient.on('error', (err) => {
  console.error('🚨 [Redis]: Error crítico de conexión:', err);
});

export default redisClient;