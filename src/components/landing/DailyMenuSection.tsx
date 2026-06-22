"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RemoteImage } from "@/components/RemoteImage";
import { PayButton, type PickSuccessData } from "@/components/PayButton";
import { PixPickSuccess } from "@/components/PixPickSuccess";
import { formatPrice } from "@/lib/pix";
import { FOOD_EMOJIS } from "@/lib/constants";
import { resetWhatsAppNavLock } from "@/lib/whatsapp";

export type MenuProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  isFeatured: boolean;
  pixBrCode: string;
  promoText: string;
};

type ProductCardProps = {
  product: MenuProduct;
  index: number;
  storeName: string;
  whatsapp: string;
  pixKey: string;
  onPickSuccess: (data: PickSuccessData) => void;
};

function ProductCard({
  product,
  index,
  storeName,
  whatsapp,
  pixKey,
  onPickSuccess,
}: ProductCardProps) {
  const emoji = FOOD_EMOJIS[index % FOOD_EMOJIS.length];
  const canPay = !!(pixKey || product.pixBrCode);
  const isLowStock = product.quantity > 0 && product.quantity <= 2;

  return (
    <article
      className={`menu-card menu-card-compact bag-product-card${product.isFeatured ? " bag-product-featured" : ""}${isLowStock ? " bag-product-scarce" : ""}${product.promoText ? " bag-product-promo" : ""}`}
    >
      {product.isFeatured && (
        <span className="bag-badge-featured">Sugestão da Maria</span>
      )}
      {isLowStock && (
        <span className="bag-badge-scarce">
          {product.quantity === 1 ? "Última unidade" : "Últimas unidades"}
        </span>
      )}

      <div className="menu-card-media bag-product-thumb">
        <span className="menu-stock bag-stock">{product.quantity}</span>
        {product.imageUrl ? (
          <RemoteImage
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes={product.isFeatured ? "88px" : "72px"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">{emoji}</div>
        )}
      </div>

      <div className="menu-card-body min-w-0 flex-1">
        <div className="menu-card-top">
          <div className="min-w-0">
            <h3 className="menu-card-name">{product.name}</h3>
            {product.promoText && (
              <p className="bag-promo-line">
                <span className="bag-promo-tag">Oferta</span>
                <span className="bag-promo-text">{product.promoText}</span>
              </p>
            )}
          </div>
          <p className="menu-card-price">
            <span className="bag-price-pill">{formatPrice(product.price)}</span>
          </p>
        </div>
        {canPay ? (
          <PayButton
            productId={product.id}
            productName={product.name}
            priceLabel={formatPrice(product.price)}
            promoText={product.promoText}
            storeName={storeName}
            whatsapp={whatsapp}
            onPickSuccess={onPickSuccess}
            className="menu-card-btn w-full !py-2"
          />
        ) : (
          <p className="text-muted mt-1 text-[10px]">PIX não configurado</p>
        )}
      </div>
    </article>
  );
}

type DailyMenuSectionProps = {
  products: MenuProduct[];
  storeName: string;
  whatsapp: string;
  pixKey: string;
  emptyMessage: string;
};

export function DailyMenuSection({
  products,
  storeName,
  whatsapp,
  pixKey,
  emptyMessage,
}: DailyMenuSectionProps) {
  const router = useRouter();
  const [pickSuccess, setPickSuccess] = useState<PickSuccessData | null>(null);

  function handlePickSuccess(data: PickSuccessData) {
    resetWhatsAppNavLock();
    setPickSuccess(data);
  }

  function handleCloseOverlay() {
    setPickSuccess(null);
    resetWhatsAppNavLock();
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <section className="bag-menu-empty">
        <span className="bag-empty-icon" aria-hidden>
          🍰
        </span>
        <h2 className="section-title mt-4 text-xl font-semibold">Bolsinha vazia hoje</h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          {emptyMessage.trim() ||
            `A bolsinha da ${storeName} está vazia por agora. Volta amanhã!`}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="bag-menu-list" aria-label="Cardápio do dia">
        <ul className="bag-menu-grid">
          {products.map((product, index) => (
            <li key={product.id} className="bag-menu-item" style={{ animationDelay: `${index * 60}ms` }}>
              <ProductCard
                product={product}
                index={index}
                storeName={storeName}
                whatsapp={whatsapp}
                pixKey={pixKey}
                onPickSuccess={handlePickSuccess}
              />
            </li>
          ))}
        </ul>
      </section>

      {pickSuccess && (
        <PixPickSuccess
          productName={pickSuccess.productName}
          priceLabel={pickSuccess.priceLabel}
          whatsappUrl={pickSuccess.whatsappUrl}
          onClose={handleCloseOverlay}
        />
      )}
    </>
  );
}
