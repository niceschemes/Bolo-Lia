"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildPixCode } from "@/lib/pix";
import { destroySession, loginWithPassword, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/upload";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";

export type ProductInput = {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  isActive: boolean;
  isFeatured?: boolean;
  imageUrl?: string;
  pixBrCode?: string;
  promoText?: string;
};

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const password = String(formData.get("password") ?? "");
  const ok = await loginWithPassword(password);

  if (!ok) {
    return { error: "Senha incorreta." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function updateProductQuantityAction(productId: string, quantity: number) {
  await requireAuth();

  const safeQty = Math.max(0, Math.round(quantity));

  await prisma.product.update({
    where: { id: productId },
    data: { quantity: safeQty },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true as const, quantity: safeQty };
}

export async function previewProductPixAction(productId: string) {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const pixKey = settings?.pixKey ?? "";

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || !product.isActive || product.quantity <= 0) {
    return { error: "Acabou! Esse item não está mais disponível." };
  }

  const customPix = product.pixBrCode.trim();
  const brCode =
    customPix.length > 0
      ? customPix
      : pixKey
        ? buildPixCode(pixKey, product.price)
        : null;

  if (!brCode) {
    return {
      error:
        "PIX não configurado. Cole o código copia e cola do item ou configure a chave PIX.",
    };
  }

  return {
    success: true as const,
    brCode,
    productName: product.name,
    remaining: product.quantity,
  };
}

export async function confirmProductPickAction(productId: string) {
  const updated = await prisma.product.updateMany({
    where: { id: productId, isActive: true, quantity: { gt: 0 } },
    data: { quantity: { decrement: 1 } },
  });

  if (updated.count === 0) {
    return { error: "Acabou! Esse item não está mais disponível." };
  }

  revalidatePath("/");

  const product = await prisma.product.findUnique({ where: { id: productId } });

  return {
    success: true as const,
    remaining: product?.quantity ?? 0,
  };
}

export async function setAllProductsActiveAction(active: boolean) {
  await requireAuth();

  await prisma.product.updateMany({
    data: active ? { isActive: true } : { isActive: false, quantity: 0 },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true as const, active };
}

export async function toggleProductActiveAction(productId: string) {
  await requireAuth();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Item não encontrado." };

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true, isActive: !product.isActive };
}

export async function setFeaturedProductAction(productId: string) {
  await requireAuth();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Item não encontrado." };

  await prisma.product.updateMany({ data: { isFeatured: false } });
  await prisma.product.update({
    where: { id: productId },
    data: { isFeatured: true, isActive: true },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true as const };
}

export async function uploadLogoAction(formData: FormData) {
  await requireAuth();

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem." };
  }

  const saved = await saveImage(file, "logo");
  if ("error" in saved) return { error: saved.error };

  await prisma.settings.update({
    where: { id: "default" },
    data: { logoUrl: saved.url },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true, logoUrl: saved.url };
}

export async function uploadProductImageAction(productId: string, formData: FormData) {
  await requireAuth();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Item não encontrado." };

  const saved = await saveImage(file, `product-${productId}`);
  if ("error" in saved) return { error: saved.error };

  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl: saved.url },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true, imageUrl: saved.url };
}

export async function saveAdminAction(formData: FormData) {
  await requireAuth();

  const storeName = String(formData.get("storeName") ?? "").trim();
  const pixKey = String(formData.get("pixKey") ?? "").trim();
  const whatsapp = normalizeWhatsAppPhone(String(formData.get("whatsapp") ?? "").trim());
  const themeColor = String(formData.get("themeColor") ?? "#b45309").trim();
  const emptyMessage = String(formData.get("emptyMessage") ?? "").trim();
  const aboutText = String(formData.get("aboutText") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const hours = String(formData.get("hours") ?? "").trim();
  const rawProducts = String(formData.get("products") ?? "[]");

  let products: ProductInput[] = [];
  try {
    products = JSON.parse(rawProducts) as ProductInput[];
  } catch {
    return { error: "Dados dos produtos inválidos." };
  }

  if (!storeName) {
    return { error: "Informe o nome da loja." };
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(themeColor)) {
    return { error: "Cor inválida." };
  }

  for (const product of products) {
    if (!product.name.trim()) {
      return { error: "Todos os itens precisam de nome." };
    }
    if (!Number.isFinite(product.price) || product.price <= 0) {
      return { error: `Preço inválido para "${product.name}".` };
    }
    if (!Number.isFinite(product.quantity) || product.quantity < 0) {
      return { error: `Quantidade inválida para "${product.name}".` };
    }
  }

  const featuredCount = products.filter((product) => product.isFeatured).length;
  if (featuredCount > 1) {
    return { error: "Só um item pode ser destaque." };
  }

  const currentSettings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      storeName,
      pixKey,
      whatsapp,
      themeColor,
      emptyMessage,
      aboutText,
      address,
      hours,
      logoUrl: currentSettings?.logoUrl ?? "",
    },
    create: {
      id: "default",
      storeName,
      pixKey,
      whatsapp,
      themeColor,
      emptyMessage,
      aboutText,
      address,
      hours,
    },
  });

  const existing = await prisma.product.findMany();
  const existingById = new Map(existing.map((item) => [item.id, item]));
  const incomingIds = new Set(
    products.map((product) => product.id).filter(Boolean) as string[],
  );

  for (const item of existing) {
    if (!incomingIds.has(item.id)) {
      await prisma.product.delete({ where: { id: item.id } });
    }
  }

  for (const [index, product] of products.entries()) {
    const data = {
      name: product.name.trim(),
      price: Math.round(product.price),
      quantity: Math.round(product.quantity),
      isActive: product.isActive,
      isFeatured: product.isFeatured ?? false,
      sortOrder: index,
      imageUrl: product.imageUrl || existingById.get(product.id!)?.imageUrl || "",
      pixBrCode: (product.pixBrCode ?? existingById.get(product.id!)?.pixBrCode ?? "").trim(),
      promoText: (product.promoText ?? existingById.get(product.id!)?.promoText ?? "").trim(),
    };

    let productId = product.id;

    if (product.id) {
      await prisma.product.update({
        where: { id: product.id },
        data,
      });
    } else {
      const created = await prisma.product.create({ data });
      productId = created.id;
    }

    const imageFile = formData.get(`productImage_${index}`);
    if (imageFile instanceof File && imageFile.size > 0 && productId) {
      const saved = await saveImage(imageFile, `product-${productId}`);
      if (!("error" in saved)) {
        await prisma.product.update({
          where: { id: productId },
          data: { imageUrl: saved.url },
        });
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true };
}
