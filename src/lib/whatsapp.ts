const WA_LOCK_KEY = "__bolsinhaWaNavLock";

type WaGlobals = typeof globalThis & { [WA_LOCK_KEY]?: boolean };

/** Trava global (sobrevive a bundles duplicados do webpack). */
function isWaNavLocked(): boolean {
  return !!(globalThis as WaGlobals)[WA_LOCK_KEY];
}

function setWaNavLocked(locked: boolean): void {
  (globalThis as WaGlobals)[WA_LOCK_KEY] = locked;
}

export function resetWhatsAppNavLock(): void {
  setWaNavLocked(false);
}

/** Navega uma vez — mesma aba, sem window.open. */
export function navigateToWhatsAppOnce(url: string): void {
  if (!url || isWaNavLocked()) return;
  setWaNavLocked(true);
  window.location.assign(url);
}

/** Dígitos únicos para wa.me (evita +55 duplicado ou número colado duas vezes). */
export function normalizeWhatsAppPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.length >= 22 && digits.length % 2 === 0) {
    const half = digits.length / 2;
    if (digits.slice(0, half) === digits.slice(half)) {
      digits = digits.slice(0, half);
    }
  }

  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
    digits = `55${digits}`;
  }

  return digits;
}

function buildWhatsAppSendUrl(digits: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send/?phone=${digits}&text=${text}&type=phone_number&app_absent=0`;
}

export function buildWhatsAppUrl(phone: string, storeName: string): string {
  const digits = normalizeWhatsAppPhone(phone);
  return buildWhatsAppSendUrl(digits, `Oi! Vim pelo site da ${storeName}.`);
}

export function buildPickedItemWhatsAppUrl(
  phone: string,
  productName: string,
  priceLabel: string,
  promoText?: string,
): string {
  const digits = normalizeWhatsAppPhone(phone);
  const promo = promoText?.trim();
  const detail = promo ? `${productName} — ${promo}` : `${productName} (${priceLabel})`;
  return buildWhatsAppSendUrl(
    digits,
    `Oi! Confirmo a retirada de ${detail}. Pagamento via PIX.`,
  );
}
