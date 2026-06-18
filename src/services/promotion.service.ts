import { prisma } from '../config/db.config';
import { whatsappQueue } from '../queues/wsp.queue';

export const createPromotion = async (data: any) => {
  const promotion = await prisma.promotion.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      value: data.value,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      targetCategoryId: data.targetCategoryId || null,
      targetProductId: data.targetProductId || null
    }
  });

  // 🚀 PIPELINE ASÍNCRONO: Notificar a clientes de manera inteligente
  // Buscamos clientes que tengan número telefónico registrado
  const clients = await prisma.client.findMany({
    where: { isActive: true, phone: { not: null } },
    select: { phone: true, name: true }
  });

  // Encolar los mensajes en BullMQ para que se envíen de forma controlada sin saturar la API de WhatsApp
  for (const client of clients) {
    if (client.phone) {
      await whatsappQueue.add(
        'SendPromoNotification',
        {
          phone: client.phone,
          message: `🔥 ¡Hola ${client.name}! No te pierdas nuestra nueva promoción: *${promotion.name}*. 🏷️ ${promotion.description || ''}. ¡Válido hasta el ${promotion.endDate.toLocaleDateString()}!`
        },
        { attempts: 2, backoff: 10000 }
      );
    }
  }

  return promotion;
};

// Función helper para que el modulo de Ventas (`processSale`) aplique descuentos en vivo
export const getActiveDiscountForProduct = async (productId: string, categoryId: string) => {
  const now = new Date();

  return await prisma.promotion.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [
        { targetProductId: productId },
        { targetCategoryId: categoryId },
        { AND: [{ targetProductId: null }, { targetCategoryId: null }] } // Descuento global
      ]
    },
    orderBy: { createdAt: 'desc' } // Priorizar la última creada
  });
};