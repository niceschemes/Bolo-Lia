"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type QrCardGeneratorProps = {
  storeName: string;
  siteUrl: string;
};

export function QrCardGenerator({ storeName, siteUrl }: QrCardGeneratorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    buildCardPreview(storeName, siteUrl).then(setPreviewUrl);
  }, [storeName, siteUrl]);

  async function buildCardPreview(name: string, url: string): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "#fffaf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 120);
    gradient.addColorStop(0, "#8b5e3c");
    gradient.addColorStop(1, "#6b4528");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 120);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, 70);

    const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 });
    const qrImage = new Image();
    qrImage.src = qrDataUrl;
    await qrImage.decode();
    ctx.drawImage(qrImage, 140, 160, 320, 320);

    ctx.fillStyle = "#2d1b14";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Pegou? Escaneie aqui", canvas.width / 2, 530);
    ctx.font = "18px Arial";
    ctx.fillStyle = "#6b5349";
    ctx.fillText("Escolha o que pegou e pague no PIX", canvas.width / 2, 570);
    ctx.fillText("Leva menos de 10 segundos", canvas.width / 2, 600);

    ctx.font = "14px Arial";
    ctx.fillText(url.replace(/^https?:\/\//, ""), canvas.width / 2, 720);

    return canvas.toDataURL("image/png");
  }

  async function handleDownload() {
    const dataUrl = await buildCardPreview(storeName, siteUrl);
    const link = document.createElement("a");
    link.download = "cartao-bolsinha.png";
    link.href = dataUrl;
    link.click();
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="admin-card p-5">
      <p className="section-label">Impressão</p>
      <h2 className="section-title mt-0.5 text-lg font-semibold">Cartão da bolsinha</h2>
      <p className="mt-1 text-sm text-[#6b5349]">
        Imprima e prenda na bolsinha. O QR leva pro site.
      </p>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview do cartão"
          className="mx-auto mt-4 w-full max-w-[220px] rounded-2xl border border-[#2d1b14]/5 shadow-md"
        />
      )}

      <p className="mt-3 break-all text-center text-xs text-[#6b5349]/60">{siteUrl}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleDownload}
          className="btn-primary flex-1 rounded-2xl py-2.5 text-sm"
        >
          Baixar cartão PNG
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="btn-ghost flex-1 py-2.5 text-sm font-bold"
        >
          {copied ? "Link copiado!" : "Copiar link"}
        </button>
      </div>
    </section>
  );
}
