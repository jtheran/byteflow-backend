import { z } from 'zod';

export const createSaleSchema = z.object({
  body: z.object({
    clientId: z.string().uuid('ID de cliente inválido.').optional().nullable(),
    paymentMethod: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'],  'El método de pago es obligatorio.',),
    items: z
      .array(
        z.object({
          productId: z.string().uuid('ID de producto inválido.'),
          quantity: z.number().int().positive('La cantidad debe ser mayor a 0.'),
        })
      )
      .min(1, 'La venta debe contener al menos un producto.'),
  }),
});