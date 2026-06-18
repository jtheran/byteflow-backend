import { z } from 'zod';

export const createPromotionSchema = z.object({
  body: z.object({
    name: z.string('El nombre de la promoción es obligatorio.'),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'TWO_FOR_ONE']),
    value: z.number().nonnegative('El valor del descuento no puede ser negativo.'),
    startDate: z.string().datetime({ message: 'Fecha de inicio inválida.' }),
    endDate: z.string().datetime({ message: 'Fecha de finalización inválida.' }),
    targetCategoryId: z.string().uuid().optional().nullable(),
    targetProductId: z.string().uuid().optional().nullable()
  }).refine(data => new Date(data.startDate) < new Date(data.endDate), {
    message: 'La fecha de inicio debe ser anterior a la fecha de finalización.',
    path: ['endDate']
  })
});