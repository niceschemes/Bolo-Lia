import { buildWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppFabProps = {
  whatsapp: string;
  storeName: string;
};

export function WhatsAppFab({ whatsapp, storeName }: WhatsAppFabProps) {
  if (!whatsapp.trim()) return null;

  const url = buildWhatsAppUrl(whatsapp, storeName);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="wa-fab"
      aria-label="Falar no WhatsApp"
    >
      💬
    </a>
  );
}
