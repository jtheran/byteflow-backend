import { prisma } from '../config/db.config';

export const openSession = async (userId: string, initialBalance: number, notes?: string) => {
  // Validar si el usuario ya tiene un turno activo sin cerrar
  const activeSession = await prisma.cashSession.findFirst({
    where: { userId, status: 'OPEN' }
  });

  if (activeSession) {
    throw new Error('Ya tienes una sesión de caja abierta actualmente. Debes cerrarla antes de abrir una nueva.');
  }

  return await prisma.cashSession.create({
    data: {
      userId,
      initialBalance,
      expectedBalance: initialBalance, // Inicia igual al monto de apertura
      notes 
    }
  });
};

export const closeSession = async (userId: string, actualBalance: number, notes?: string) => {
  const session = await prisma.cashSession.findFirst({
    where: { userId, status: 'OPEN' }
  });

  if (!session) {
    throw new Error('No se encontró ninguna sesión de caja abierta para tu usuario.');
  }

  // Calcular la suma de todas las ventas en EFECTIVO realizadas desde que se abrió la caja hasta ahora
  const cashSalesAgg = await prisma.sale.aggregate({
    where: {
      isActive: true,
      paymentMethod: 'EFECTIVO',
      createdAt: { gte: session.openedAt }
    },
    _sum: { total: true }
  });

  const totalCashSales = Number(cashSalesAgg._sum.total) || 0;
  const expectedBalance = Number(session.initialBalance) + totalCashSales;
  const difference = actualBalance - expectedBalance; // Positivo = Sobrante, Negativo = Faltante

  return await prisma.cashSession.update({
    where: { id: session.id },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
      expectedBalance,
      actualBalance,
      difference,
      notes: notes ? `${session.notes || ''} | Cierre: ${notes}` : session.notes
    }
  });
};

export const getCurrentSessionStatus = async (userId: string) => {
  const session = await prisma.cashSession.findFirst({
    where: { userId, status: 'OPEN' }
  });

  if (!session) return { hasActiveSession: false, session: null };

  // Retornar un estimado en vivo de lo que debería haber en caja en este instante
  const cashSalesAgg = await prisma.sale.aggregate({
    where: {
      isActive: true,
      paymentMethod: 'EFECTIVO',
      createdAt: { gte: session.openedAt }
    },
    _sum: { total: true }
  });

  const totalCashSales = Number(cashSalesAgg._sum.total) || 0;

  return {
    hasActiveSession: true,
    session: {
      ...session,
      liveExpectedBalance: Number(session.initialBalance) + totalCashSales,
      currentSalesInCash: totalCashSales
    }
  };
};