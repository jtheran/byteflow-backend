import { prisma } from '../config/db.config';

export const createCategory = async (data: any) => {
  const existing = await prisma.category.findUnique({ where: { name: data.name } });
  if (existing) throw new Error('Ya existe una categoría registrada con ese nombre.');

  return await prisma.category.create({
    data: {
      name: data.name,
      description: data.description || null
    }
  });
};

export const getAllCategories = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    name: search ? { contains: search, mode: 'insensitive' as const } : undefined
  };

  const [total, data] = await prisma.$transaction([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })
  ]);

  return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

export const updateCategory = async (id: string, data: any) => {
  if (data.name) {
    const existing = await prisma.category.findFirst({
      where: { name: data.name, NOT: { id } }
    });
    if (existing) throw new Error('El nuevo nombre de categoría ya está en uso.');
  }

  return await prisma.category.update({
    where: { id },
    data
  });
};

export const changeCategoryStatus = async (id: string, isActive: boolean) => {
  return await prisma.category.update({
    where: { id },
    data: { isActive }
  });
};