import { z } from 'zod';

export const TestWhatsappSchema = z.object({
    body: z.object({
      phone: z
        .string()
        .min(1, 'El número de teléfono es requerido.')
        .min(8, 'El número de teléfono es demasiado corto.')
        .max(20, 'El número de teléfono es demasiado largo.')
        .regex(/^\d+$/, 'El número de teléfono debe contener únicamente dígitos numéricos y el código de país (ej: 573001234567).'),
      text: z
        .string()
        .min(1, 'El contenido del mensaje no puede estar vacío.')
        .max(500, 'El mensaje supera el límite permitido de 500 caracteres para pruebas.')
    })
});

export const sendMediaSchema = z.object({
  body: z.object({
    phone: z
      .string('El telefono es obligatorio.')
      .min(7, 'El teléfono debe tener un formato válido.')
      .max(20, 'El teléfono es demasiado largo.'),
    
    mediaType: z.enum(['image', 'video', 'audio', 'document'], 'El tipo de media (mediaType) es obligatorio.'),

    url: z
      .string()
      .url('La URL provista debe ser un enlace HTTP/HTTPS válido.')
      .optional(),

    base64: z
      .string()
      .min(10, 'La cadena en Base64 es demasiado corta o inválida.')
      .optional(),

    mimetype: z
      .string('El mimetype del archivo es obligatorio.')
      .regex(/^[^/]+\/[^/]+$/, 'El formato del mimetype debe ser válido (ej: application/pdf, image/jpeg).'),

    filename: z
      .string('El nombre del archivo (filename) es obligatorio.')
      .min(1, 'El nombre del archivo no puede estar vacío.'),

    caption: z
      .string()
      .max(1024, 'El texto acompañante no puede superar los 1024 caracteres.')
      .optional(),
  })
  // Regla de negocio cruzada: Debe venir obligatoriamente o la URL o el string Base64
  .refine((data) => data.url || data.base64, {
    message: 'Debes proporcionar al menos una fuente para el archivo: "url" o "base64".',
    path: ['url'], // Apunta el error al campo url
  }),
});