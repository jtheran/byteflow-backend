import { z } from 'zod';

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid('ID de proveedor inválido.'),
    items: z.array(z.object({
      productId: z.string().uuid('ID de producto inválido.'),
      quantity: z.number().int().positive('La cantidad debe ser mayor a 0.'),
      unitCost: z.number().positive('El costo unitario debe ser mayor a 0.')
    })).min(1, 'La compra debe tener al menos un artículo.')
  })
});