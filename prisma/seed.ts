import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { PrismaClient } from "../src/generated/prisma/client";
import { photoForProductName } from "../src/lib/constants";

function createSeedClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter: new PrismaLibSql(libsql as never) });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./dev.db",
    }),
  });
}

const prisma = createSeedClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD ?? "maria123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { id: "admin" },
    update: { passwordHash },
    create: { id: "admin", passwordHash },
  });

  const whatsapp = "5519971675276";

  await prisma.settings.upsert({
    where: { id: "default" },
    update: { whatsapp },
    create: {
      id: "default",
      storeName: "Doces da Maria",
      pixKey: "",
      whatsapp,
    },
  });

  const products = [
    {
      name: "Coxinha",
      price: 800,
      quantity: 5,
      sortOrder: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Brigadeiro",
      price: 500,
      quantity: 8,
      sortOrder: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Bolo (fatia)",
      price: 1200,
      quantity: 2,
      sortOrder: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({ data: products });
  }

  const empadaImage = photoForProductName("Empada de frango")!;
  const empadaExisting = await prisma.product.findFirst({
    where: { name: "Empada de frango" },
  });
  const empadaData = {
    name: "Empada de frango",
    price: 700,
    promoText: "1 empada R$7",
    quantity: 12,
    isActive: true,
    isFeatured: true,
    sortOrder: -1,
    imageUrl: empadaImage,
  };

  if (empadaExisting) {
    await prisma.product.update({
      where: { id: empadaExisting.id },
      data: empadaData,
    });
  } else {
    await prisma.product.create({ data: empadaData });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
