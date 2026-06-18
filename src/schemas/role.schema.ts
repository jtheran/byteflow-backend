import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string('El nombre del rol es obligatorio.')
      .min(3, 'El nombre debe tener al menos 3 caracteres.')
      .toUpperCase(),
    description: z.string().optional(),
    permissions: z
      .array(z.string().uuid('ID de permiso inválido.'))
      .min(1, 'Debes asignar al menos un permiso al rol.')
  })
});

export const assignPermissionsSchema = z.object({
  body: z.object({
    permissions: z
      .array(z.string().uuid('ID de permiso inválido.'))
      .min(1, 'La lista de permisos no puede estar vacía.')
  })
});