import { z } from 'zod';

export const openSessionSchema = z.object({
  body: z.object({
    initialBalance: z.number().nonnegative('El balance inicial no puede ser negativo.'),
    notes: z.string().optional()
  })
});

export const closeSessionSchema = z.object({
  body: z.object({
    actualBalance: z.number().nonnegative('El conteo físico de caja no puede ser un valor negativo.'),
    notes: z.string().optional()
  })
});