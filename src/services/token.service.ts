import jwt from 'jsonwebtoken';
import config from '../config/config';
import redisClient from '../config/redis.config';

interface ITokenPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

// 1. Generar Access Token (Vida Corta)
export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m' });
};

// 2. Generar Refresh Token (Vida Larga) y guardarlo en Redis
export const generateRefreshToken = async (userId: string, payload: ITokenPayload): Promise<string> => {
  const refreshToken = jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  // Guardamos el Refresh Token en Redis asociado al usuario con una expiración de 7 días (en segundos)
  const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
  await redisClient.set(`refresh_token:${userId}`, refreshToken, 'EX', SEVEN_DAYS_IN_SECONDS);

  return refreshToken;
};

// 3. Revocar Refresh Token (Logout Seguro)
export const revokeRefreshToken = async (userId: string): Promise<void> => {
  await redisClient.del(`refresh_token:${userId}`);
};

// 4. Validar si el Refresh Token sigue siendo válido en Redis
export const validateRefreshTokenInRedis = async (userId: string, tokenReceived: string): Promise<boolean> => {
  const storedToken = await redisClient.get(`refresh_token:${userId}`);
  return storedToken === tokenReceived;
};