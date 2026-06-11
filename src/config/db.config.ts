import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import config from './config';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Evita crear múltiples instancias de Prisma Client en desarrollo debido al Hot Reloading
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
        connectionString: config.databaseURL,
      }),
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;