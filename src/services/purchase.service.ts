// src/services/purchase.service.ts
import { prisma } from '../config/db.config';

export const processPurchase = async (data: any, userId: string, userEmail: string) => {
  return await prisma.$transaction(async (tx:any) => {
    const count = await tx.purchase.count();
    const orderNumber = `COMP-${String(count + 1).padStart(5, '0')}`;

    let totalCalculated = 0;
    const itemsToCreate = [];
    const stockAndCostUpdates = [];
    const kardexMovements = [];

    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Producto ${item.productId} no encontrado.`);

      totalCalculated += (item.unitCost * item.quantity);

      itemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        unitCost: item.unitCost
      });

      // Actualizamos stock y el último costo conocido del producto
      stockAndCostUpdates.push(
        tx.product.update({
          where: { id: product.id },
          data: { 
            stock: { increment: item.quantity },
            cost: item.unitCost // Actualizamos al último costo de compra
          }
        })
      );

      kardexMovements.push({
        productId: product.id,
        quantity: item.quantity,
        type: 'COMPRA' as const,
        reason: `Entrada por compra a proveedor. Orden: ${orderNumber}`,
        userId,
        userEmail
      });
    }

    const purchase = await tx.purchase.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        total: totalCalculated,
        items: { create: itemsToCreate }
      },
      include: { supplier: true, items: { include: { product: true } } }
    });

    await Promise.all(stockAndCostUpdates);
    await tx.stockMovement.createMany({ data: kardexMovements });

    return purchase;
  });
};