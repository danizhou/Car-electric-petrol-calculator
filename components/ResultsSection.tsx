import type { TripResult } from "@/lib/calculator";
import { formatEuro, formatNumber } from "@/lib/format";

interface ResultsSectionProps {
  result: TripResult | null;
  pricePerKwh: number;
}

interface TileProps {
  label: string;
  value: string;
  detail: string;
  tone?: "good" | "bad";
}

function Tile({ label, value, detail, tone }: TileProps) {
  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className={`tile-value ${tone ?? ""}`}>{value}</div>
      <div className="tile-detail">{detail}</div>
    </div>
  );
}

export function ResultsSection({ result, pricePerKwh }: ResultsSectionProps) {
  if (!result) {
    return (
      <section className="card">
        <h2>Risultati</h2>
        <p className="note">Inserisci valori validi per vedere il confronto.</p>
      </section>
    );
  }

  const { petrolOnly, fullBattery, savings, savingsPercent, petrolCostPer100Km, breakevenPricePerKwh } = result;

  const fullBatteryDetail =
    fullBattery.petrolKm > 0
      ? `${formatNumber(fullBattery.kwh)} kWh (${formatNumber(fullBattery.electricKm, 1)} km) + ` +
        `${formatNumber(fullBattery.litres)} L (${formatNumber(fullBattery.petrolKm, 1)} km)`
      : `${formatNumber(fullBattery.kwh)} kWh, tutto in elettrico`;

  const savingsDetail =
    savings >= 0
      ? `${formatNumber(savingsPercent, 1)}% in meno partendo carichi`
      : `${formatNumber(-savingsPercent, 1)}% in più: conviene la benzina`;

  return (
    <section className="card">
      <h2>Risultati</h2>
      <div className="results">
        <Tile
          label="Scenario A · 100% benzina"
          value={formatEuro(petrolOnly.cost)}
          detail={`${formatNumber(petrolOnly.litres)} L di benzina`}
        />
        <Tile label="Scenario B · batteria carica" value={formatEuro(fullBattery.cost)} detail={fullBatteryDetail} />
        <Tile
          label="Risparmio netto"
          value={formatEuro(savings)}
          detail={savingsDetail}
          tone={savings >= 0 ? "good" : "bad"}
        />
        <Tile
          label="Soglia di pareggio elettricità"
          value={`${formatNumber(breakevenPricePerKwh, 3)} €/kWh`}
          detail={`Oltre questo prezzo conviene la benzina (${formatEuro(petrolCostPer100Km)} ogni 100 km)`}
          tone={pricePerKwh <= breakevenPricePerKwh ? "good" : "bad"}
        />
      </div>
    </section>
  );
}
