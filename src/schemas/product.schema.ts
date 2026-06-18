import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string('El SKU o código de barras es obligatorio.' ).min(3, 'El SKU debe tener al menos 3 caracteres.'),
    name: z.string('El nombre del producto es obligatorio.' ).min(2, 'El nombre es demasiado corto.'),
    description: z.string().optional(),
    price: z.number('El precio de venta es obligatorio.' ).positive('El precio debe ser un número positivo.'),
    cost: z.number('El costo es obligatorio.' ).nonnegative('El costo no puede ser negativo.'),
    stock: z.number().int().nonnegative('El stock inicial no puede ser negativo.').default(0),
    minStock: z.number().int().positive('El stock mínimo debe ser al menos 1.').default(5),
    categoryId: z.string('La categoría es obligatoria.' ).uuid('ID de categoría inválido.'),
    supplierId: z.string().uuid('ID de proveedor inválido.').optional(),
    expirationDate: z.preprocess((arg) => {
      if (typeof arg === 'string' && arg.trim() !== '') return new Date(arg);
      return null;
    }, z.date().nullable().optional())
  })
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial()
});