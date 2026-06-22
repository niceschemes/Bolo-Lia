import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { photoForProductName } from "../src/lib/constants";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./dev.db",
    }),
  });

  const products = await prisma.product.findMany();

  for (const product of products) {
    const url = photoForProductName(product.name);
    if (!url) {
      console.log(`⊘ ${product.name} — sem foto mapeada`);
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: url },
    });
    console.log(`✓ ${product.name}`);
  }

  await prisma.$disconnect();
  console.log("\nFotos demo aplicadas.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
