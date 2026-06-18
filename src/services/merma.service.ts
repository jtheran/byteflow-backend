import { prisma } from '../config/db.config';

export const processStockAdjustment = async (data: any, userId: string, userEmail: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verificar existencia del producto
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product || !product.isActive) {
      throw new Error('El producto seleccionado no existe o está inactivo.');
    }

    // 2. Si es un ajuste negativo (salida/merma), validar que no deje el stock en negativo
    if (data.quantity < 0 && (product.stock + data.quantity) < 0) {
      throw new Error(`Operación inválida. El stock actual es ${product.stock} y estás intentando restar ${Math.abs(data.quantity)}.`);
    }

    // 3. Actualizar el stock del producto
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: {
        stock: {
          increment: data.quantity // Si es negativo, Prisma lo resta automáticamente
        }
      }
    });

    // 4. Registrar la traza en el Kárdex (StockMovement)
    const movement = await tx.stockMovement.create({
      data: {
        productId: data.productId,
        quantity: data.quantity,
        type: data.type, // MERMA o AJUSTE_INVENTARIO
        reason: data.reason,
        userId,
        userEmail
      },
      include: { product: true }
    });

    return { product: updatedProduct, movement };
  });
};

export const getExpiredProductsAlerts = async () => {
  const today = new Date();
  
  // Buscar productos cuya fecha de vencimiento sea menor o igual a hoy
  return await prisma.product.findMany({
    where: {
      isActive: true,
      expirationDate: {
        lte: today,
        not: null
      }
    },
    orderBy: { expirationDate: 'asc' }
  });
};