import { z } from 'zod';

export const createAdjustmentSchema = z.object({
  body: z.object({
    productId: z.string().uuid('ID de producto inválido.'),
    quantity: z.number().int('La cantidad debe ser un número entero.').refine(val => val !== 0, {
      message: 'La cantidad del ajuste no puede ser cero.'
    }), // Positivo incrementa stock, negativo decrementa (mermas, pérdidas)
    type: z.enum(['AJUSTE_INVENTARIO', 'MERMA'], 'El tipo de movimiento es obligatorio.'),
    reason: z.string('Debes justificar la razón del ajuste manual.').min(5, 'La razón es muy corta.')
  })
});