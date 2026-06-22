"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmProductPickAction, previewProductPixAction } from "@/lib/actions";
import { buildPickedItemWhatsAppUrl } from "@/lib/whatsapp";

export type PickSuccessData = {
  productName: string;
  priceLabel: string;
  whatsappUrl: string | null;
};

type PayButtonProps = {
  productId: string;
  productName: string;
  priceLabel: string;
  storeName: string;
  whatsapp?: string;
  promoText?: string;
  disabled?: boolean;
  className?: string;
  onPickSuccess: (data: PickSuccessData) => void;
};

export function PayButton({
  productId,
  productName,
  priceLabel,
  whatsapp,
  promoText,
  disabled = false,
  className = "",
  onPickSuccess,
}: PayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick() {
    if (disabled || loading) return;

    setLoading(true);
    setError(null);

    const preview = await previewProductPixAction(productId);

    if (preview?.error || !preview?.brCode) {
      setLoading(false);
      setError(preview?.error ?? "Não foi possível abrir o PIX.");
      return;
    }

    try {
      await navigator.clipboard.writeText(preview.brCode);
    } catch {
      setLoading(false);
      setError("Não foi possível copiar o PIX. Tente de novo.");
      return;
    }

    const confirm = await confirmProductPickAction(productId);

    if (confirm?.error) {
      setLoading(false);
      setError(confirm.error);
      router.refresh();
      return;
    }

    const whatsappUrl =
      whatsapp?.trim()
        ? buildPickedItemWhatsAppUrl(whatsapp, productName, priceLabel, promoText)
        : null;

    setLoading(false);
    onPickSuccess({ productName, priceLabel, whatsappUrl });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handlePick}
        disabled={disabled || loading}
        className={`btn-boutique btn-pick !px-4 !py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <span className="btn-pick-loading">Processando</span>
        ) : (
          <>
            <span>Retirar</span>
            <span className="btn-pick-badge">PIX</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-center text-[10px] font-bold text-red-500">{error}</p>
      )}
    </div>
  );
}
