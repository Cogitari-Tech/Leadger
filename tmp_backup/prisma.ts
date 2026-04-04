import { PrismaClient } from "@prisma/client";

/**
 * Shared PrismaClient singleton.
 * Prevents connection pool exhaustion from creating a new PrismaClient per request.
 * In development, stores on globalThis to survive HMR reloads.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
