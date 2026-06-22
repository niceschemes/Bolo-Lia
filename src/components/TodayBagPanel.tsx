"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/pix";
import type { ProductInput } from "@/lib/actions";

type TodayBagPanelProps = {
  products: ProductInput[];
  onToggle: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onToggleAll: (active: boolean) => void;
  onSetFeatured: (index: number) => void;
};

export function TodayBagPanel({
  products,
  onToggle,
  onQuantityChange,
  onToggleAll,
  onSetFeatured,
}: TodayBagPanelProps) {
  const activeCount = products.filter((p) => p.isActive && p.quantity > 0).length;
  const totalUnits = products
    .filter((p) => p.isActive)
    .reduce((sum, p) => sum + p.quantity, 0);

  return (
    <section className="admin-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label">Rotina diária</p>
          <h2 className="section-title mt-0.5 text-xl font-semibold">Bolsinha de hoje</h2>
          <p className="mt-1 text-sm text-[#6b5349]">
            {activeCount} {activeCount === 1 ? "tipo" : "tipos"} · {totalUnits}{" "}
            {totalUnits === 1 ? "unidade" : "unidades"}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff0f4] to-[#fce4ec] text-xl">
          🛍️
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onToggleAll(true)}
          className="rounded-full bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800"
        >
          Ativar todos
        </button>
        <button
          type="button"
          onClick={() => onToggleAll(false)}
          className="btn-ghost rounded-full px-3.5 py-2 text-xs font-bold text-[#6b5349]"
        >
          Esvaziar bolsinha
        </button>
      </div>

      <ul className="mt-4 space-y-2.5">
        {products.map((product, index) => (
          <li
            key={product.id ?? `today-${index}`}
            className={`admin-row p-3 ${product.isActive ? "is-active" : "opacity-75"}`}
          >
            <div className="flex items-center gap-3">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt=""
                  width={44}
                  height={44}
                  unoptimized
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-black/5"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#fff0f4] to-[#ffd4bc] text-lg">
                  🧁
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-[#2d1b14]">
                  {product.name || "Sem nome"}
                </p>
                <p className="text-sm font-medium text-[#6b5349]">
                  {formatPrice(product.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggle(index)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  product.isActive ? "btn-primary text-white" : "btn-ghost text-[#6b5349]"
                }`}
              >
                {product.isActive ? "Levei" : "Não"}
              </button>
            </div>

            {product.isActive && (
              <div className="mt-3 space-y-3 border-t border-[#2d1b14]/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6b5349]">Quantidade</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onQuantityChange(index, Math.max(0, product.quantity - 1))
                      }
                      className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-lg font-bold text-[#2d1b14]">
                      {product.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(index, product.quantity + 1)}
                      className="btn-primary flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSetFeatured(index)}
                  disabled={!product.id}
                  className={`w-full rounded-full px-3 py-2 text-xs font-bold transition ${
                    product.isFeatured
                      ? "bg-gradient-to-r from-[#f7c8d8] to-[#fce4ec] text-[#6b4528] ring-2 ring-[#e85d75]/40"
                      : "btn-ghost text-[#6b5349]"
                  }`}
                >
                  {product.isFeatured ? "★ Destaque de hoje" : "☆ Marcar como destaque"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {products.length === 0 && (
        <p className="mt-4 text-center text-sm text-[#6b5349]">
          Adicione produtos abaixo para montar a bolsinha.
        </p>
      )}
    </section>
  );
}
