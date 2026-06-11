import { z } from 'zod';

export const TestEmailSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'El correo de destino es requerido para la prueba.')
      .email({ message: 'El formato del correo electrónico no es válido.' })
  })
});