import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

async function main() {
  const count = await prisma.product.count();
  console.log("OK — produtos no banco:", count);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("ERRO no banco:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
