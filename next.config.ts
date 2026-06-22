import type { NextConfig } from "next";
import path from "node:path";

const isCiBuild = process.env.CI === "true";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@prisma/client",
    "@prisma/adapter-d1",
    ".prisma/client",
    "@libsql/client",
    "@vercel/blob",
  ],
  turbopack: isCiBuild
    ? {
        resolveAlias: {
          "@/lib/prisma-local": path.join(
            process.cwd(),
            "src/lib/prisma-local.stub.ts",
          ),
        },
      }
    : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
