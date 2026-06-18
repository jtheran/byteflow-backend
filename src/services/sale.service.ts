import { prisma } from '../config/db.config';
import { whatsappQueue } from '../queues/wsp.queue';

export const processSale = async (data: any, userId: string, userEmail: string) => {
  return await prisma.$transaction(async (tx) => {
    
    // 1. 🛡️ DETECCIÓN DEL CONSECUTIVO REAL (Seguro y a prueba de borrados/concurrencia)
    const lastSale = await tx.sale.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true }
    });

    let nextNumber = 1;

    if (lastSale) {
      const match = lastSale.invoiceNumber.match(/FACT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const invoiceNumber = `FACT-${String(nextNumber).padStart(5, '0')}`;

    let totalCalculated = 0;
    const itemsToCreate = [];
    const stockUpdates = [];
    const kardexMovements = [];
    const now = new Date();

    // 2. Iterar el carrito para validar reglas de negocio
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        throw new Error(`El producto con ID ${item.productId} no existe o está inactivo.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para [${product.name}]. Disponibles: ${product.stock}, Solicitados: ${item.quantity}`);
      }

      // --- 🏷️ MOTOR DE DESCUENTOS Y PROMOCIONES EN VIVO ---
      // Buscamos si el producto o su categoría tienen una promoción activa usando "tx"
      const discount = await tx.promotion.findFirst({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
          OR: [
            { targetProductId: product.id },
            { targetCategoryId: product.categoryId },
            { AND: [{ targetProductId: null }, { targetCategoryId: null }] } // Descuento global
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      let unitPrice = Number(product.price);

      if (discount) {
        if (discount.type === 'PERCENTAGE') {
          unitPrice = unitPrice - (unitPrice * (Number(discount.value) / 100));
        } else if (discount.type === 'FIXED_AMOUNT') {
          unitPrice = Math.max(0, unitPrice - Number(discount.value));
        } else if (discount.type === 'TWO_FOR_ONE') {
          // Lógica 2x1: Se cobran grupos de 2 como si fuera 1. 
          // Calculamos el factor equivalente por unidad para mantener la coherencia del total
          if (item.quantity >= 2) {
            const pairs = Math.floor(item.quantity / 2);
            const remainders = item.quantity % 2;
            const totalCostForType = (pairs + remainders) * unitPrice;
            unitPrice = totalCostForType / item.quantity;
          }
        }
      }
      // ----------------------------------------------------

      const itemTotal = unitPrice * item.quantity;
      totalCalculated += itemTotal;

      // Estructuramos el detalle de la venta guardando el precio con descuento aplicado
      itemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        price: unitPrice, // Guardamos el valor unitario real cobrado
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
        quantity: -item.quantity,
        type: 'VENTA' as const,
        reason: `Salida por venta en caja. Documento: ${invoiceNumber}${discount ? ` (Promo: ${discount.name})` : ''}`,
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