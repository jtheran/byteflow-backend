import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    nit: z.string('El NIT o documento fiscal es obligatorio.').min(5, 'El NIT debe tener al menos 5 caracteres.'),
    companyName: z.string('La razón social/empresa es obligatoria.' ).min(2, 'El nombre es muy corto.'),
    contactName: z.string().optional(),
    phone: z.string().optional().or(z.literal('')),
    email: z.string().email('Formato de correo inválido.').optional().or(z.literal('')),
    address: z.string().optional()
  })
});

export const updateSupplierSchema = z.object({
  body: createSupplierSchema.shape.body.partial()
});