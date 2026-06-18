import { prisma } from '../config/db.config';
import bcrypt from 'bcryptjs';

export const createUser = async (data: any) => {
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) throw new Error('El correo electrónico ya se encuentra registrado.');

  const existingUser = await prisma.user.findUnique({ where: { dni: data.dni } });
  if (existingUser) throw new Error('El DNI de usuario ya está en uso.');

  // Encriptar la contraseña de acceso inicial
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      dni: data.dni,
      passwordHash: hashedPassword,
      role: data.role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
};

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    OR: search ? [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } }
    ] : undefined
  };

  const [total, data] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

export const updateUser = async (id: string, data: any) => {
  if (data.email) {
    const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
    if (existing) throw new Error('El nuevo correo electrónico ya está en uso.');
  }

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  return await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true }
  });
};

export const changeUserStatus = async (id: string, isActive: boolean) => {
  return await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, isActive: true }
  });
};