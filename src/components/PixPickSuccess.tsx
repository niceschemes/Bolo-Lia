"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { navigateToWhatsAppOnce } from "@/lib/whatsapp";

type PixPickSuccessProps = {
  productName: string;
  priceLabel: string;
  whatsappUrl: string | null;
  onClose: () => void;
};

export function PixPickSuccess({
  productName,
  priceLabel,
  whatsappUrl,
  onClose,
}: PixPickSuccessProps) {
  const [openedWhatsApp, setOpenedWhatsApp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const openedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function handleWhatsAppClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (openedRef.current || !whatsappUrl) return;

    openedRef.current = true;
    setOpenedWhatsApp(true);
    navigateToWhatsAppOnce(whatsappUrl);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="pix-pick-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pix-pick-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pix-pick-card">
        <div className="pix-pick-badge" aria-hidden>
          ✓
        </div>

        <h2 id="pix-pick-title" className="pix-pick-title">
          PIX copiado!
        </h2>

        <p className="pix-pick-product">
          {productName} · {priceLabel}
        </p>

        <ol className="pix-pick-steps">
          <li>Abra o app do seu banco</li>
          <li>
            Pix → <strong>Colar código</strong>
          </li>
          <li>Confirme o pagamento</li>
        </ol>

        {whatsappUrl ? (
          <>
            <p className="pix-pick-countdown">
              {openedWhatsApp ? (
                <>Redirecionando para o WhatsApp…</>
              ) : (
                <>Depois de pagar, confirme no WhatsApp com um toque.</>
              )}
            </p>

            {!openedWhatsApp ? (
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="btn-boutique pix-pick-cta w-full !py-3.5 text-sm"
              >
                Confirmar no WhatsApp
              </button>
            ) : (
              <button type="button" onClick={onClose} className="btn-boutique pix-pick-cta w-full !py-3.5 text-sm">
                Voltar ao cardápio
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={onClose} className="btn-boutique pix-pick-cta w-full !py-3.5 text-sm">
            Entendi
          </button>
        )}

        {whatsappUrl && !openedWhatsApp && (
          <button type="button" onClick={onClose} className="pix-pick-dismiss">
            Só pagar por enquanto
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
