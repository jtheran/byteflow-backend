import { prisma } from '../config/db.config';
import { whatsappQueue } from '../queues/wsp.queue';

export const processSale = async (data: any, userId: string, userEmail: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Generar número de factura consecutivo simple (Basado en conteo)
    const count = await tx.sale.count();
    const invoiceNumber = `FACT-${String(count + 1).padStart(5, '0')}`;

    let totalCalculated = 0;
    const itemsToCreate = [];
    const stockUpdates = [];
    const kardexMovements = [];

    // 2. Iterar el carrito para validar reglas de negocio
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        throw new Error(`El producto con ID ${item.productId} no existe o está inactivo.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para [${product.name}]. Disponibles: ${product.stock}, Solicitados: ${item.quantity}`);
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalCalculated += itemTotal;

      // Estructuramos el detalle de la venta
      itemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      // Estructuramos la rebaja de stock directo en Product
      stockUpdates.push(
        tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        })
      );

      // Estructuramos la traza para auditoría en el Kárdex
      kardexMovements.push({
        productId: product.id,
        quantity: -item.quantity, // Negativo porque es salida
        type: 'VENTA' as const,
        reason: `Salida por venta en caja. Documento: ${invoiceNumber}`,
        userId,
        userEmail,
      });
    }

    // 3. Persistir la cabecera de la Venta con sus detalles
    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        paymentMethod: data.paymentMethod,
        clientId: data.clientId || null,
        total: totalCalculated,
        items: { create: itemsToCreate },
      },
      include: {
        client: true,
        items: { include: { product: true } },
      },
    });

    // 4. Ejecutar actualizaciones de stock y kárdex en bloque
    await Promise.all(stockUpdates);
    await tx.stockMovement.createMany({ data: kardexMovements });

    // 5. 🚀 PIPELINE ASÍNCRONO: Si el cliente tiene teléfono, encolar el comprobante por WhatsApp
    if (sale.client?.phone) {
      await whatsappQueue.add(
        'SendInvoiceNotification',
        {
          phone: sale.client.phone,
          message: `👋 ¡Hola ${sale.client.name}! Gracias por tu compra en ByteFlow. 🧾 Tu comprobante ${sale.invoiceNumber} por un total de $${sale.total} ha sido generado con éxito.`,
        },
        { attempts: 3, backoff: 5000 }
      );
    }

    return sale;
  });
};

export const getSaleById = async (id: string) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { client: true, items: { include: { product: true } } },
  });
  if (!sale) throw new Error('El registro de venta solicitado no existe.');
  return sale;
};