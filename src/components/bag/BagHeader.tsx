import { RemoteImage } from "@/components/RemoteImage";

const WEEKDAYS = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;

type BagHeaderProps = {
  storeName: string;
  logoUrl?: string;
  itemCount?: number;
  totalUnits?: number;
  hours?: string;
  hasLowStock?: boolean;
};

export function BagHeader({
  storeName,
  logoUrl,
  itemCount = 0,
  totalUnits = 0,
  hours = "",
  hasLowStock = false,
}: BagHeaderProps) {
  const weekday = WEEKDAYS[new Date().getDay()];
  const hoursLabel = hours.trim();

  return (
    <header className="bag-header">
      <div className="bag-header-card">
        <div className="bag-header-row">
          <div className="bag-logo-wrap">
            {logoUrl ? (
              <RemoteImage
                src={logoUrl}
                alt={storeName}
                width={44}
                height={44}
                className="bag-logo-img"
              />
            ) : (
              <span className="bag-logo-fallback" aria-hidden>
                🧁
              </span>
            )}
          </div>

          <div className="bag-header-text min-w-0">
            <div className="bag-live-pill">
              <span className="bag-live-dot" aria-hidden />
              Bolsinha do dia
              {itemCount > 0 && (
                <span className="bag-item-count">{itemCount} itens</span>
              )}
            </div>
            <h1 className="bag-title">{storeName}</h1>
          </div>
        </div>

        {itemCount > 0 && (
          <p className="bag-urgency">
            <span className="bag-urgency-today">Só hoje</span>
            <span className="bag-urgency-sep" aria-hidden>
              ·
            </span>
            <span className="capitalize">{weekday}</span>
            {hoursLabel && (
              <>
                <span className="bag-urgency-sep" aria-hidden>
                  ·
                </span>
                <span>até {hoursLabel}</span>
              </>
            )}
            {totalUnits > 0 && (
              <>
                <span className="bag-urgency-sep" aria-hidden>
                  ·
                </span>
                <span>{totalUnits} un.</span>
              </>
            )}
          </p>
        )}

        {hasLowStock && (
          <p className="bag-urgency-alert" role="status">
            <span className="bag-urgency-alert-dot" aria-hidden />
            Alguns itens estão acabando
          </p>
        )}

        <div className="bag-flow" aria-label="Como funciona">
          <span className="bag-flow-step">
            <em>1</em> Seleciona
          </span>
          <span className="bag-flow-arrow" aria-hidden>
            →
          </span>
          <span className="bag-flow-step">
            <em>2</em> PIX
          </span>
          <span className="bag-flow-arrow" aria-hidden>
            →
          </span>
          <span className="bag-flow-step">
            <em>3</em> Confirma
          </span>
        </div>
      </div>
    </header>
  );
}
