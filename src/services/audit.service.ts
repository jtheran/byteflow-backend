// src/services/audit.service.ts
import prisma from '../config/db.config';

interface ICreateAuditInput {
  userId?: string;
  userEmail?: string;
  action: string;
  module: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode: number;
}

interface IGetAuditFilters {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  userEmail?: string;
}

export const createAuditLog = async (data: ICreateAuditInput): Promise<void> => {
  try {
    // Registramos en PostgreSQL de manera asíncrona
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        module: data.module,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        statusCode: data.statusCode,
      },
    });
  } catch (error) {
    // Si la auditoría falla, la pintamos en consola para no romper el flujo principal del sistema, pero que quede evidencia
    console.error('🚨 Error crítico al guardar log de auditoría en la DB:', error);
  }
};

export const getAuditLogsService = async (filters: IGetAuditFilters) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const skip = (page - 1) * limit;

  // Construcción dinámica de condiciones de búsqueda de SQL
  const whereConditions: any = {};

  if (filters.module) whereConditions.module = filters.module;
  if (filters.action) whereConditions.action = filters.action;
  if (filters.userEmail) {
    whereConditions.userEmail = {
      contains: filters.userEmail,
      mode: 'insensitive', // Ignora mayúsculas/minúsculas
    };
  }

  // Ejecutamos consultas en paralelo para mejorar el rendimiento
  const [logs, totalRecords] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' }, // Los más recientes primero
      skip,
      take: limit,
      include: {
        user: {
          select: { name: true, dni: true } // Trae solo datos específicos del usuario si existe
        }
      }
    }),
    prisma.auditLog.count({ where: whereConditions })
  ]);

  return {
    logs,
    pagination: {
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      perPage: limit
    }
  };
};