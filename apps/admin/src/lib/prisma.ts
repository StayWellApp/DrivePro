import { prisma as databasePrisma, PrismaClient } from "@repo/database";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || databasePrisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
