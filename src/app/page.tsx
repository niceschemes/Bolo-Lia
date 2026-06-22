import { prisma } from "@/lib/prisma";
import { BagDecor } from "@/components/bag/BagDecor";
import { BagHeader } from "@/components/bag/BagHeader";
import { DailyMenuSection } from "@/components/landing/DailyMenuSection";
import { WhatsAppFab } from "@/components/landing/WhatsAppFab";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const products = await prisma.product.findMany({
    where: { isActive: true, quantity: { gt: 0 } },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
  });

  const storeName = settings?.storeName ?? "Doces da Maria";
  const pixKey = settings?.pixKey ?? "";
  const whatsapp = settings?.whatsapp ?? "";
  const logoUrl = settings?.logoUrl ?? "";
  const emptyMessage = settings?.emptyMessage ?? "";
  const hours = settings?.hours ?? "";
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const hasLowStock = products.some((p) => p.quantity <= 2);

  return (
    <div className="bag-app">
      <div className="ambient-bg" aria-hidden />
      <BagDecor />

      <main className="bag-main">
        <BagHeader
          storeName={storeName}
          logoUrl={logoUrl || undefined}
          itemCount={products.length}
          totalUnits={totalUnits}
          hours={hours}
          hasLowStock={hasLowStock}
        />

        <DailyMenuSection
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl,
            quantity: p.quantity,
            isFeatured: p.isFeatured,
            pixBrCode: p.pixBrCode,
            promoText: p.promoText,
          }))}
          storeName={storeName}
          whatsapp={whatsapp}
          pixKey={pixKey}
          emptyMessage={emptyMessage}
        />
      </main>

      {whatsapp && (
        <WhatsAppFab whatsapp={whatsapp} storeName={storeName} />
      )}
    </div>
  );
}
