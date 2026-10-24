import { NumberField } from "./NumberField";

export interface TripFields {
  distanceKm: string;
  pricePerKwh: string;
  pricePerLitre: string;
}

interface TripSectionProps {
  values: TripFields;
  onChange: (values: TripFields) => void;
}

export function TripSection({ values, onChange }: TripSectionProps) {
  const set = (key: keyof TripFields) => (value: string) => onChange({ ...values, [key]: value });

  return (
    <section className="card">
      <h2>Viaggio</h2>
      <div className="grid">
        <NumberField id="distanceKm" label="Distanza totale (km)" value={values.distanceKm} onChange={set("distanceKm")} />
        <NumberField id="pricePerKwh" label="Costo elettricità (€/kWh)" value={values.pricePerKwh} onChange={set("pricePerKwh")} />
        <NumberField id="pricePerLitre" label="Costo benzina (€/L)" value={values.pricePerLitre} onChange={set("pricePerLitre")} />
      </div>
    </section>
  );
}
