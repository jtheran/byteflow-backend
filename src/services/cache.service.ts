import redisClient from '../config/redis.config';

// Guardar datos en caché con un tiempo de vida (TTL) por defecto de 5 minutos
export const setCache = async (key: string, value: any, ttlSeconds: number = 300): Promise<void> => {
  try {
    const stringData = JSON.stringify(value);
    await redisClient.set(key, stringData, 'EX', ttlSeconds);
  } catch (error) {
    console.error(`🚨 Error al escribir en caché para la key [${key}]:`, error);
  }
};

// Obtener datos de la caché
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedData = await redisClient.get(key);
    if (!cachedData) return null;
    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error(`🚨 Error al leer de la caché para la key [${key}]:`, error);
    return null;
  }
};

// Invalidar o borrar caché (Obligatorio cuando creas, editas o eliminas un registro)
export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`🚨 Error al invalidar la caché para la key [${key}]:`, error);
  }
};