import { NumberField } from "./NumberField";

export interface TripFields {
  distanceKm: string;
  pricePerKwh: string;
  pricePerLitre: string;
  /** Empty means a full battery. */
  availableEvKm: string;
}

interface TripSectionProps {
  values: TripFields;
  onChange: (values: TripFields) => void;
  /** Car's max electric range, shown as the full-battery default. */
  maxEvRangeKm: string;
}

export function TripSection({ values, onChange, maxEvRangeKm }: TripSectionProps) {
  const set = (key: keyof TripFields) => (value: string) => onChange({ ...values, [key]: value });

  return (
    <section className="card">
      <h2>Viaggio</h2>
      <div className="grid">
        <NumberField id="distanceKm" label="Distanza totale (km)" value={values.distanceKm} onChange={set("distanceKm")} />
        <NumberField id="pricePerKwh" label="Costo elettricità (€/kWh)" value={values.pricePerKwh} onChange={set("pricePerKwh")} />
        <NumberField id="pricePerLitre" label="Costo benzina (€/L)" value={values.pricePerLitre} onChange={set("pricePerLitre")} />
        <NumberField
          id="availableEvKm"
          label="Km elettrici disponibili alla partenza"
          value={values.availableEvKm}
          onChange={set("availableEvKm")}
          placeholder={maxEvRangeKm ? `Pieno (${maxEvRangeKm} km)` : "Pieno"}
          hint="Quelli che segna l'auto prima di passare a benzina. Vuoto = batteria piena."
        />
      </div>
    </section>
  );
}
