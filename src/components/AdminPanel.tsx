"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { QrCardGenerator } from "@/components/QrCardGenerator";
import { Toast } from "@/components/Toast";
import { TodayBagPanel } from "@/components/TodayBagPanel";
import {
  saveAdminAction,
  uploadLogoAction,
  uploadProductImageAction,
  type ProductInput,
} from "@/lib/actions";

type AdminPanelProps = {
  storeName: string;
  pixKey: string;
  whatsapp: string;
  logoUrl: string;
  emptyMessage: string;
  aboutText: string;
  address: string;
  hours: string;
  siteUrl: string;
  products: ProductInput[];
};

function emptyProduct(): ProductInput {
  return {
    name: "",
    price: 500,
    quantity: 0,
    isActive: false,
    isFeatured: false,
    imageUrl: "",
    pixBrCode: "",
    promoText: "",
  };
}

function formatReais(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function parseReais(value: string) {
  const normalized = value.replace(",", ".").trim();
  const reais = Number(normalized);
  if (!Number.isFinite(reais) || reais <= 0) return null;
  return Math.round(reais * 100);
}

function CollapseSection({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div>
          <p className="section-label">Opcional</p>
          <h2 className="section-title mt-0.5 text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-[#6b5349]">{subtitle}</p>
        </div>
        <span className="text-[#6b5349]">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="space-y-4 border-t border-[#2d1b14]/5 px-5 pb-5 pt-4">{children}</div>}
    </section>
  );
}

export function AdminPanel({
  storeName,
  pixKey,
  whatsapp,
  logoUrl,
  emptyMessage,
  aboutText,
  address,
  hours,
  siteUrl,
  products: initialProducts,
}: AdminPanelProps) {
  const router = useRouter();
  const [storeNameValue, setStoreNameValue] = useState(storeName);
  const [pixKeyValue, setPixKeyValue] = useState(pixKey);
  const [whatsappValue, setWhatsappValue] = useState(whatsapp);
  const [emptyMessageValue, setEmptyMessageValue] = useState(emptyMessage);
  const [hoursValue, setHoursValue] = useState(hours);
  const [logoPreview, setLogoPreview] = useState(logoUrl);
  const [products, setProducts] = useState<ProductInput[]>(
    initialProducts.length > 0 ? initialProducts : [emptyProduct()],
  );
  const [pendingImages, setPendingImages] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showSettings, setShowSettings] = useState(!pixKey || !whatsapp);

  const priceInputs = useMemo(
    () => products.map((product) => formatReais(product.price)),
    [products],
  );

  function updateProduct(index: number, patch: Partial<ProductInput>) {
    setProducts((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  function toggleToday(index: number) {
    const product = products[index];
    if (product.id) {
      void import("@/lib/actions").then(({ toggleProductActiveAction }) =>
        toggleProductActiveAction(product.id!).then((result) => {
          if (result?.error) {
            setMessage(result.error);
            return;
          }
          setProducts((current) =>
            current.map((item) =>
              item.id === product.id
                ? { ...item, isActive: result.isActive ?? !item.isActive }
                : item,
            ),
          );
          setMessage(result.isActive ? "Na bolsinha!" : "Removido.");
          router.refresh();
        }),
      );
      return;
    }
    updateProduct(index, { isActive: !product.isActive });
  }

  function changeQuantity(index: number, quantity: number) {
    const safeQty = Math.max(0, quantity);
    updateProduct(index, { quantity: safeQty });

    const product = products[index];
    if (product?.id) {
      void import("@/lib/actions").then(({ updateProductQuantityAction }) =>
        updateProductQuantityAction(product.id!, safeQty).then(() => {
          setMessage(`Quantidade: ${safeQty}`);
          router.refresh();
        }),
      );
    }
  }

  function toggleAllToday(active: boolean) {
    setProducts((current) => current.map((p) => ({ ...p, isActive: active })));

    const hasSaved = products.some((p) => p.id);
    if (hasSaved) {
      void import("@/lib/actions").then(({ setAllProductsActiveAction }) =>
        setAllProductsActiveAction(active).then(() => {
          setMessage(active ? "Bolsinha montada!" : "Bolsinha esvaziada!");
          router.refresh();
        }),
      );
    }
  }

  function setFeatured(index: number) {
    const product = products[index];
    if (!product?.id) {
      setMessage("Salve o doce antes de marcar destaque.");
      return;
    }

    void import("@/lib/actions").then(({ setFeaturedProductAction }) =>
      setFeaturedProductAction(product.id!).then((result) => {
        if (result?.error) {
          setMessage(result.error);
          return;
        }
        setProducts((current) =>
          current.map((item, itemIndex) => ({
            ...item,
            isFeatured: itemIndex === index,
          })),
        );
        setMessage("Destaque atualizado!");
        router.refresh();
      }),
    );
  }

  function addProduct() {
    setProducts((current) => [...current, emptyProduct()]);
    setShowCatalog(true);
  }

  function removeProduct(index: number) {
    setProducts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handlePendingImage(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Imagem muito grande (máx. 2 MB).");
      event.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setPendingImages((current) => ({ ...current, [index]: preview }));

    if (products[index]?.id) {
      void handleProductImageUpload(products[index].id!, file);
    }
  }

  async function handleProductImageUpload(productId: string, file: File) {
    const formData = new FormData();
    formData.set("image", file);

    const result = await uploadProductImageAction(productId, formData);
    if (result?.error) {
      setMessage(result.error);
      return;
    }

    if (result.imageUrl) {
      setProducts((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, imageUrl: result.imageUrl } : item,
        ),
      );
    }
    setMessage("Foto salva!");
    router.refresh();
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Imagem muito grande (máx. 2 MB).");
      event.target.value = "";
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.set("logo", file);

    const result = await uploadLogoAction(formData);
    setUploadingLogo(false);

    if (result?.error) {
      setMessage(result.error);
      return;
    }

    if (result.logoUrl) setLogoPreview(result.logoUrl);
    setMessage("Logo atualizada!");
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("storeName", storeNameValue);
    formData.set("pixKey", pixKeyValue);
    formData.set("whatsapp", whatsappValue);
    formData.set("themeColor", "#e85d75");
    formData.set("emptyMessage", emptyMessageValue);
    formData.set("aboutText", aboutText);
    formData.set("address", address);
    formData.set("hours", hoursValue);
    formData.set("products", JSON.stringify(products));

    const form = event.currentTarget;
    products.forEach((product, index) => {
      if (!product.id) {
        const input = form.querySelector<HTMLInputElement>(
          `input[name="productImage_${index}"]`,
        );
        if (input?.files?.[0]) {
          formData.set(`productImage_${index}`, input.files[0]);
        }
      }
    });

    const result = await saveAdminAction(formData);
    setSaving(false);

    if (result?.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Salvo!");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <TodayBagPanel
        products={products}
        onToggle={toggleToday}
        onQuantityChange={changeQuantity}
        onToggleAll={toggleAllToday}
        onSetFeatured={setFeatured}
      />

      <p className="rounded-xl bg-[#f7c8d8]/30 px-4 py-3 text-center text-xs font-semibold text-[#6b5349]">
        O que você marca acima já vai pro site na hora. Não precisa apertar Salvar.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <CollapseSection
          title="Meus doces"
          subtitle="Cadastra uma vez: nome, preço e foto"
          open={showCatalog}
          onToggle={() => setShowCatalog((v) => !v)}
        >
          <div className="flex justify-end">
            <button type="button" onClick={addProduct} className="btn-primary rounded-full px-4 py-2 text-xs">
              + Novo doce
            </button>
          </div>

          <ul className="space-y-4">
            {products.map((product, index) => (
              <li key={product.id ?? `new-${index}`} className="admin-row p-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    {(product.imageUrl || pendingImages[index]) && (
                      <Image
                        src={product.imageUrl || pendingImages[index]}
                        alt={product.name}
                        width={64}
                        height={64}
                        unoptimized
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    )}
                    <label className="mt-2 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[#8b5e3c]/20 px-2 py-2 text-center text-[10px] font-bold text-[#6b5349]">
                      📷 Foto
                      <input
                        type="file"
                        accept="image/*"
                        name={product.id ? undefined : `productImage_${index}`}
                        onChange={(event) => handlePendingImage(index, event)}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      value={product.name}
                      onChange={(event) => updateProduct(index, { name: event.target.value })}
                      className="input-soft w-full px-3 py-2 text-sm font-bold"
                      placeholder="Nome do doce"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#6b5349]">R$</span>
                      <input
                        value={priceInputs[index]}
                        onChange={(event) => {
                          const cents = parseReais(event.target.value);
                          if (cents !== null) updateProduct(index, { price: cents });
                        }}
                        className="input-soft w-24 px-3 py-2 text-sm"
                      />
                    </div>
                    <input
                      value={product.promoText ?? ""}
                      onChange={(event) => updateProduct(index, { promoText: event.target.value })}
                      className="input-soft w-full px-3 py-2 text-xs"
                      placeholder="Oferta: 1 empada R$7"
                    />
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-xs font-bold text-red-600"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CollapseSection>

        <CollapseSection
          title="PIX, WhatsApp e QR"
          subtitle="Configura uma vez"
          open={showSettings}
          onToggle={() => setShowSettings((v) => !v)}
        >
          <label className="block text-sm font-bold text-ink">
            Nome na bolsinha
            <input
              value={storeNameValue}
              onChange={(event) => setStoreNameValue(event.target.value)}
              className="input-soft mt-1.5 w-full px-4 py-2.5"
            />
          </label>

          <label className="block text-sm font-bold text-ink">
            Chave PIX
            <input
              value={pixKeyValue}
              onChange={(event) => setPixKeyValue(event.target.value)}
              className="input-soft mt-1.5 w-full px-4 py-2.5"
              placeholder="CPF, e-mail ou telefone"
            />
          </label>

          <label className="block text-sm font-bold text-ink">
            WhatsApp da Maria
            <input
              value={whatsappValue}
              onChange={(event) => setWhatsappValue(event.target.value)}
              className="input-soft mt-1.5 w-full px-4 py-2.5"
              placeholder="5511999999999"
            />
          </label>

          <label className="block text-sm font-bold text-ink">
            Horário da bolsinha (urgência no site)
            <input
              value={hoursValue}
              onChange={(event) => setHoursValue(event.target.value)}
              className="input-soft mt-1.5 w-full px-4 py-2.5"
              placeholder="Ex: 15h"
            />
          </label>

          <label className="block text-sm font-bold text-ink">
            Se a bolsinha estiver vazia
            <input
              value={emptyMessageValue}
              onChange={(event) => setEmptyMessageValue(event.target.value)}
              className="input-soft mt-1.5 w-full px-4 py-2.5"
              placeholder="Ex: Volta amanhã!"
            />
          </label>

          <div>
            <p className="text-sm font-bold text-ink">Logo (opcional)</p>
            {logoPreview && (
              <Image
                src={logoPreview}
                alt="Logo"
                width={64}
                height={64}
                unoptimized
                className="mt-2 h-16 w-16 rounded-xl object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="mt-2 block w-full text-sm"
            />
          </div>

          <QrCardGenerator storeName={storeNameValue} siteUrl={siteUrl} />
        </CollapseSection>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary rounded-2xl px-4 py-4 text-sm font-bold disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar doces e ajustes"}
        </button>
      </form>

      <Toast message={message} onClear={() => setMessage(null)} />
    </div>
  );
}
