import type { PrismaClient } from "@/generated/prisma/client";

export function getLocalPrismaClient(): PrismaClient {
  throw new Error("SQLite local não disponível neste build.");
}
