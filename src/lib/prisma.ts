import { cache } from "react";
import { PrismaClient } from "@/generated/prisma/client";

type D1Database = import("@cloudflare/workers-types").D1Database;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createLocalPrismaClient(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./dev.db",
    }),
  });
}

function createD1PrismaClient(d1: D1Database): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaD1 } = require("@prisma/adapter-d1");
  return new PrismaClient({ adapter: new PrismaD1(d1) });
}

type CloudflareEnvWithDb = { DB?: D1Database };

function getCloudflareD1(): D1Database | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    return (env as CloudflareEnvWithDb)?.DB ?? null;
  } catch {
    return null;
  }
}

export const getPrisma = cache((): PrismaClient => {
  const d1 = getCloudflareD1();
  if (d1) return createD1PrismaClient(d1);

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createLocalPrismaClient();
  }
  return globalForPrisma.prisma;
});

export const getPrismaAsync = cache(async (): Promise<PrismaClient> => {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const d1 = (env as CloudflareEnvWithDb).DB;
    if (d1) return createD1PrismaClient(d1);
  } catch {
    // fora do Cloudflare
  }
  return getPrisma();
});

/** Compat: usa D1 no Cloudflare e SQLite local no dev. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
