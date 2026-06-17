import { prisma } from '../config/db.config';

export const createSupplier = async (data: any) => {
  const existing = await prisma.supplier.findUnique({ where: { nit: data.nit } });
  if (existing) throw new Error('El NIT ya se encuentra registrado por otro proveedor.');

  return await prisma.supplier.create({
    data: {
      nit: data.nit,
      companyName: data.companyName,
      contactName: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null
    }
  });
};

export const getAllSuppliers = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    OR: search ? [
      { companyName: { contains: search, mode: 'insensitive' as const } },
      { nit: { contains: search, mode: 'insensitive' as const } }
    ] : undefined
  };

  const [total, data] = await prisma.$transaction([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      skip,
      take: limit,
      orderBy: { companyName: 'asc' }
    })
  ]);

  return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

export const updateSupplier = async (id: string, data: any) => {
  if (data.nit) {
    const existing = await prisma.supplier.findFirst({
      where: { nit: data.nit, NOT: { id } }
    });
    if (existing) throw new Error('El nuevo NIT ya pertenece a otro proveedor.');
  }

  return await prisma.supplier.update({
    where: { id },
    data
  });
};

export const changeSupplierStatus = async (id: string, isActive: boolean) => {
  return await prisma.supplier.update({
    where: { id },
    data: { isActive }
  });
};