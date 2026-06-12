import { prisma } from '../config/db.config';

export const createClient = async (data: any) => {
  const existing = await prisma.client.findUnique({ where: { document: data.document } });
  if (existing) throw new Error('El documento de identidad ya se encuentra registrado.');

  if (data.email) {
    const existingEmail = await prisma.client.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new Error('El correo electrónico ya está registrado por otro cliente.');
  }

  return await prisma.client.create({
    data: {
      document: data.document,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null
    }
  });
};

export const getAllClients = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    OR: search ? [
      { name: { contains: search, mode: 'insensitive' as const } },
      { document: { contains: search, mode: 'insensitive' as const } }
    ] : undefined
  };

  const [total, data] = await prisma.$transaction([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })
  ]);

  return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

export const getClientByIdOrDocument = async (identifier: string) => {
  const client = await prisma.client.findFirst({
    where: {
      isActive: true,
      OR: [{ id: identifier }, { document: identifier }]
    }
  });
  if (!client) throw new Error('Cliente no encontrado o inactivo.');
  return client;
};

export const updateClient = async (id: string, data: any) => {
  if (data.document) {
    const existing = await prisma.client.findFirst({
      where: { document: data.document, NOT: { id } }
    });
    if (existing) throw new Error('El nuevo documento ya está asignado a otro cliente.');
  }

  return await prisma.client.update({
    where: { id },
    data: {
      document: data.document,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined
    }
  });
};

export const changeClientStatus = async (id: string, isActive: boolean) => {
  return await prisma.client.update({
    where: { id },
    data: { isActive }
  });
};