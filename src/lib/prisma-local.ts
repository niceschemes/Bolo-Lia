import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getLocalPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? "file:./dev.db",
      }),
    });
  }
  return globalForPrisma.prisma;
}
