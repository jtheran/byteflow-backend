import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string('El nombre de la categoría es obligatorio.')
      .min(2, 'El nombre debe tener al menos 2 caracteres.'),
    description: z.string().optional()
  })
});

export const updateCategorySchema = z.object({
  body: createCategorySchema.shape.body.partial()
});