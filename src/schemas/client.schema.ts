import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    document: z
      .string('El documento de identidad (Cédula/NIT) es obligatorio.')
      .min(4, 'El documento debe tener al menos 4 caracteres.'),
    name: z
      .string('El nombre o razón social es obligatorio.' )
      .min(2, 'El nombre es demasiado corto.'),
    email: z
      .string()
      .email('El formato del correo electrónico es inválido.')
      .optional()
      .or(z.literal('')), // Permite strings vacíos sin fallar
    phone: z
      .string()
      .min(7, 'El teléfono debe tener al menos 7 dígitos.')
      .optional()
      .or(z.literal('')),
    address: z.string().optional()
  })
});

export const updateClientSchema = z.object({
  body: createClientSchema.shape.body.partial()
});