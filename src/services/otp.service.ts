// src/services/otp.service.ts
import crypto from 'crypto';
import redisClient from '../config/redis.config';
import { addEmailToQueue } from '../queues/email.queue';

// Generar un número aleatorio criptográficamente seguro de 6 dígitos
const generateNumericOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Genera un OTP, lo almacena en Redis asociado al email y lo encola para envío
 */
export const sendOTPService = async (email: string): Promise<void> => {
  const otp = generateNumericOTP();
  const REDIS_KEY = `otp:${email}`;
  const FIVE_MINUTES_IN_SECONDS = 300;

  // 1. Guardamos el OTP en Redis con expiración automática de 5 minutos
  await redisClient.set(REDIS_KEY, otp, 'EX', FIVE_MINUTES_IN_SECONDS);

  // 2. Encolamos de forma asíncrona el envío del correo usando BullMQ
  await addEmailToQueue({
    to: email,
    subject: '🔑 Código de Verificación de Seguridad - ByteFlow',
    template: 'otp-verification',
    context: {
      otpToken: otp
    }
  });
};

/**
 * Valida si el OTP coincide con el almacenado en Redis.
 * Si es válido, lo destruye de inmediato (Single-Use Principle).
 */
export const verifyOTPService = async (email: string, otpReceived: string): Promise<boolean> => {
  const REDIS_KEY = `otp:${email}`;
  const storedOtp = await redisClient.get(REDIS_KEY);

  if (!storedOtp || storedOtp !== otpReceived) {
    return false;
  }

  // Ciberseguridad: Un token OTP solo debe servir una vez. Si coincide, se elimina inmediatamente.
  await redisClient.del(REDIS_KEY);
  return true;
};