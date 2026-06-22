import { createStaticPix, hasError } from "pix-utils";

const MERCHANT_NAME = "Doces da Maria";
const MERCHANT_CITY = "BRASILIA";

export function buildPixCode(pixKey: string, amountInCents: number): string | null {
  if (!pixKey.trim()) return null;

  const pix = createStaticPix({
    merchantName: MERCHANT_NAME.slice(0, 25),
    merchantCity: MERCHANT_CITY,
    pixKey: pixKey.trim(),
    transactionAmount: amountInCents / 100,
  });

  if (hasError(pix)) return null;

  return pix.toBRCode();
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
