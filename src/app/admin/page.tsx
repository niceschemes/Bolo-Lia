import { headers } from "next/headers";
import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { AdminPanel } from "@/components/AdminPanel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAuth();

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3001";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  return (
    <div className="bg-confeitaria min-h-dvh pb-10">
      <main className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="anim-rise mb-6 flex items-center justify-between">
          <div>
            <p className="section-label">Maria</p>
            <h1 className="section-title mt-0.5 text-2xl font-semibold">Bolsinha de hoje</h1>
            <p className="mt-1 text-sm text-[#6b5349]">Marca o que trouxe — o site atualiza sozinho.</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost px-4 py-2.5 text-sm font-semibold text-[#6b5349]">
              Sair
            </button>
          </form>
        </div>

        <AdminPanel
          storeName={settings?.storeName ?? "Doces da Maria"}
          pixKey={settings?.pixKey ?? ""}
          whatsapp={settings?.whatsapp ?? ""}
          logoUrl={settings?.logoUrl ?? ""}
          emptyMessage={settings?.emptyMessage ?? ""}
          aboutText={settings?.aboutText ?? ""}
          address={settings?.address ?? ""}
          hours={settings?.hours ?? ""}
          siteUrl={siteUrl}
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            imageUrl: product.imageUrl,
            quantity: product.quantity,
            pixBrCode: product.pixBrCode,
            promoText: product.promoText,
          }))}
        />

        <p className="mt-8 text-center text-sm text-[#6b5349]">
          <Link href="/" className="font-bold text-[#8b5e3c] transition hover:text-[#6b4528]">
            Ver site público →
          </Link>
        </p>
      </main>
    </div>
  );
}
