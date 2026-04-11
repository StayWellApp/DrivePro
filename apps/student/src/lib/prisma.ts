import { PrismaClient, mapGeometryToGeoJSON } from "@repo/database";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export { mapGeometryToGeoJSON };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;