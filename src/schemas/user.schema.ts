import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string('El nombre de usuario es obligatorio.' )
      .min(3, 'El username debe tener al menos 3 caracteres.'),
    email: z
      .string('El correo electrónico es obligatorio.')
      .email('Formato de correo electrónico inválido.'),
    dni: z
      .string('el DNI es obligatorio')
      .min(8, 'el DNI debe tener al menos 6 caracteres.'),
    passwordHash: z
      .string('La contraseña es obligatoria.')
      .min(6, 'La contraseña interna debe tener al menos 6 caracteres.'),
    role: z.enum(['ADMIN', 'SUPERVISOR', 'CASHIER'], 'El rol seleccionado no es válido en el POS.')
  })
});

export const updateUserSchema = z.object({
  body: createUserSchema.shape.body.partial()
});