import { z } from 'zod';

// Esquema existente para emails
export const TestEmailSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'El correo de destino es requerido para la prueba.')
      .email({ message: 'El formato del correo electrónico no es válido.' })
  })
});

// NUEVO: Esquema moderno para validar la Notificación Push
export const TestPushSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'El título de la notificación es requerido.')
      .max(100, 'El título es demasiado largo (máximo 100 caracteres).'),
    message: z
      .string()
      .min(1, 'El mensaje de la notificación es requerido.')
      .max(250, 'El mensaje es demasiado largo (máximo 250 caracteres).'),
    type: z
      .enum(['info', 'warning', 'success', 'danger'], 'El tipo debe ser estrictamente: info, warning, success o danger.')
  })
});