import type { PutBlobResult } from "@vercel/blob";

const MAX_BYTES = 2 * 1024 * 1024;

function isCloudflareRuntime(): boolean {
  return Boolean(
    process.env.CF_PAGES ||
      process.env.CLOUDFLARE_ACCOUNT_ID ||
      process.env.CLOUDFLARE_API_TOKEN,
  );
}

export async function saveImage(
  file: File,
  key: string,
): Promise<{ url: string } | { error: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "Arquivo precisa ser uma imagem." };
  }

  if (file.size > MAX_BYTES) {
    return { error: "Imagem muito grande (máx. 2 MB)." };
  }

  const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const filename = `${key}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob: PutBlobResult = await put(`uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return { url: blob.url };
  }

  if (isCloudflareRuntime()) {
    return {
      error: "Configure BLOB_READ_WRITE_TOKEN nas variáveis do Cloudflare para salvar fotos.",
    };
  }

  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return { url: `/uploads/${filename}?v=${Date.now()}` };
}
