"use client";

import { useEffect, useState } from "react";
import { BUILT_IN_CARS, loadCustomCars, saveCustomCars, type CarPreset } from "@/lib/cars";
import { parseDecimal, toInputValue } from "@/lib/format";
import { NumberField } from "./NumberField";

export interface CarFields {
  maxEvRangeKm: string;
  evConsumptionPer100Km: string;
  iceConsumptionPer100Km: string;
  batteryKwh: string;
}

export function carToFields(car: CarPreset): CarFields {
  return {
    maxEvRangeKm: toInputValue(car.maxEvRangeKm),
    evConsumptionPer100Km: toInputValue(car.evConsumptionPer100Km),
    iceConsumptionPer100Km: toInputValue(car.iceConsumptionPer100Km),
    batteryKwh: toInputValue(car.batteryKwh),
  };
}

interface CarSectionProps {
  values: CarFields;
  onChange: (values: CarFields) => void;
}

export function CarSection({ values, onChange }: CarSectionProps) {
  const [customCars, setCustomCars] = useState<CarPreset[]>([]);
  const [selectedId, setSelectedId] = useState(BUILT_IN_CARS[0].id);
  const [note, setNote] = useState(`Valori caricati: ${BUILT_IN_CARS[0].name}.`);

  // Read saved cars after mount so server and client render the same markup.
  useEffect(() => setCustomCars(loadCustomCars()), []);

  const cars = [...BUILT_IN_CARS, ...customCars];
  const selected = cars.find((c) => c.id === selectedId);

  const set = (key: keyof CarFields) => (value: string) => onChange({ ...values, [key]: value });

  const updateCustomCars = (next: CarPreset[]) => {
    setCustomCars(next);
    saveCustomCars(next);
  };

  const handleLoad = () => {
    if (!selected) return;
    onChange(carToFields(selected));
    setNote(`Valori caricati: ${selected.name}. Puoi modificarli per testare scenari diversi.`);
  };

  const handleSave = () => {
    const name = window.prompt("Nome dell'auto:")?.trim();
    if (!name) return;

    const toNumber = (v: string) => {
      const n = parseDecimal(v);
      return Number.isFinite(n) ? n : 0;
    };
    const battery = parseDecimal(values.batteryKwh);
    const car: CarPreset = {
      id: `custom-${Date.now()}`,
      name,
      maxEvRangeKm: toNumber(values.maxEvRangeKm),
      evConsumptionPer100Km: toNumber(values.evConsumptionPer100Km),
      iceConsumptionPer100Km: toNumber(values.iceConsumptionPer100Km),
      batteryKwh: Number.isFinite(battery) ? battery : null,
    };

    updateCustomCars([...customCars, car]);
    setSelectedId(car.id);
    setNote(`Salvata: ${car.name}.`);
  };

  const handleDelete = () => {
    if (!selected || selected.builtIn) return;
    if (!window.confirm(`Eliminare "${selected.name}"?`)) return;

    updateCustomCars(customCars.filter((c) => c.id !== selected.id));
    setSelectedId(BUILT_IN_CARS[0].id);
    setNote(`Eliminata: ${selected.name}.`);
  };

  return (
    <section className="card">
      <h2>Auto</h2>
      <div className="presets">
        <select aria-label="Auto salvate" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleLoad}>
          Precarica auto
        </button>
        <button type="button" className="ghost" onClick={handleSave}>
          Salva come nuova
        </button>
        {selected && !selected.builtIn && (
          <button type="button" className="danger" onClick={handleDelete}>
            Elimina
          </button>
        )}
      </div>
      <div className="grid">
        <NumberField id="maxEvRangeKm" label="Autonomia EV massima (km)" value={values.maxEvRangeKm} onChange={set("maxEvRangeKm")} />
        <NumberField id="evConsumption" label="Consumo elettrico (kWh/100 km)" value={values.evConsumptionPer100Km} onChange={set("evConsumptionPer100Km")} />
        <NumberField id="iceConsumption" label="Consumo benzina (L/100 km)" value={values.iceConsumptionPer100Km} onChange={set("iceConsumptionPer100Km")} />
        <NumberField id="batteryKwh" label="Batteria (kWh, informativo)" value={values.batteryKwh} onChange={set("batteryKwh")} />
      </div>
      <p className="note">{note}</p>
    </section>
  );
}
