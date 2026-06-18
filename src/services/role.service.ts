import { prisma } from '../config/db.config';

export const getAllPermissions = async () => {
  return await prisma.permission.findMany({
    orderBy: { slug: 'asc' }
  });
};

export const createRoleWithPermissions = async (data: any) => {
  const existingRole = await prisma.role.findUnique({ where: { name: data.name } });
  if (existingRole) throw new Error('Ya existe un rol con este nombre.');

  return await prisma.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        name: data.name,
        description: data.description || null
      }
    });

    const rolePermissions = data.permissions.map((pId: string) => ({
      roleId: role.id,
      permissionId: pId
    }));

    await tx.rolePermission.createMany({ data: rolePermissions });

    return tx.role.findUnique({
      where: { id: role.id },
      include: { permissions: { include: { permission: true } } }
    });
  });
};

export const updateRolePermissions = async (roleId: string, permissionIds: string[]) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error('El rol especificado no existe.');

  return await prisma.$transaction(async (tx) => {
    // 1. Limpiar los permisos actuales del rol
    await tx.rolePermission.deleteMany({ where: { roleId } });

    // 2. Insertar la nueva selección de permisos
    const newRelations = permissionIds.map((pId) => ({
      roleId,
      permissionId: pId
    }));

    await tx.rolePermission.createMany({ data: newRelations });

    return tx.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } }
    });
  });
};

export const getRolesSummary = async () => {
  return await prisma.role.findMany({
    include: {
      _count: { select: { users: true } },
      permissions: { include: { permission: true } }
    },
    orderBy: { name: 'asc' }
  });
};