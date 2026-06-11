import { z } from 'zod';

export const LoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido.') // <--- Reemplaza el required_error de forma nativa
      .email({ message: 'El formato del correo electrónico no es válido.' })
      .max(150, 'El correo no puede exceder los 150 caracteres.'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida.') // <--- Reemplaza el required_error de forma nativa
      .min(6, 'La contraseña debe tener al menos 6 caracteres.')
      .max(50, 'La contraseña es demasiado larga.')
  })
})

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string()
      .min(1, 'El token de refresco es requerido para procesar la solicitud.')
  })
});