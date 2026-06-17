import { prisma } from '../config/db.config';

export const getAnalyticsSummary = async () => {
  // Obtenemos la fecha de inicio del día de hoy a las 00:00:00
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    salesAgg,
    purchasesAgg,
    totalProducts,
    lowStockProducts,
    topSellingItems,
    salesByMethod
  ] = await Promise.all([
    // 1. Métricas de Ventas Históricas Totales y del Día
    prisma.sale.aggregate({
      where: { isActive: true },
      _sum: { total: true },
      _count: { id: true },
    }),

    // 2. Costo total invertido en Abastecimiento (Compras a proveedores)
    prisma.purchase.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { total: true },
    }),

    // 3. Conteo de catálogo general
    prisma.product.count({ where: { isActive: true } }),

    // 4. Productos que están por debajo de su stock mínimo de seguridad
    prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: prisma.product.fields.minStock }
      },
      select: { id: true, sku: true, name: true, stock: true, minStock: true },
      take: 5,
      orderBy: { stock: 'asc' }
    }),

    // 5. Top 5 productos más vendidos (Agrupando por ProductId)
    prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { isActive: true } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    // 6. Ventas segmentadas por método de pago (Para cuadre de caja)
    prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: { isActive: true, createdAt: { gte: startOfDay } },
      _sum: { total: true },
      _count: { id: true }
    })
  ]);

  // 7. Hidratar los nombres de los productos más vendidos
  const hydratedTopProducts = await Promise.all(
    topSellingItems.map(async (item) => {
      const prod = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, sku: true }
      });
      return {
        name: prod?.name || 'Producto Desconocido',
        sku: prod?.sku || '',
        quantitySold: item._sum.quantity || 0
      };
    })
  );

  // Cálculos financieros base
  const totalSalesRevenue = Number(salesAgg._sum.total) || 0;
  const totalPurchasesCost = Number(purchasesAgg._sum.total) || 0;
  const totalSalesCount = salesAgg._count.id || 0;
  
  // Ticket promedio general
  const averageTicket = totalSalesCount > 0 ? (totalSalesRevenue / totalSalesCount) : 0;

  // Ganancia Bruta estimada del ecosistema
  const estimatedNetProfit = totalSalesRevenue - totalPurchasesCost;

  return {
    financials: {
      totalSalesRevenue,
      totalPurchasesCost,
      estimatedNetProfit,
      averageTicket: Number(averageTicket.toFixed(2)),
      totalSalesCount
    },
    inventoryStatus: {
      totalActiveProducts: totalProducts,
      lowStockAlertCount: lowStockProducts.length,
      criticalItems: lowStockProducts
    },
    topSellingProducts: hydratedTopProducts,
    todayPaymentMethodsSquare: salesByMethod.map(method => ({
      method: method.paymentMethod,
      count: method._count.id,
      total: Number(method._sum.total) || 0
    }))
  };
};