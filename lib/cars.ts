import type { CarSpec } from "./calculator.ts";

export interface CarPreset extends CarSpec {
  id: string;
  name: string;
  /** Battery capacity in kWh. Informational only, not used in calculations. */
  batteryKwh: number | null;
  builtIn?: boolean;
}

export const BUILT_IN_CARS: CarPreset[] = [
  {
    id: "geely-starray-emi-pro",
    name: "Geely Starray EM-i Pro (18 kWh)",
    maxEvRangeKm: 82,
    evConsumptionPer100Km: 14.7,
    iceConsumptionPer100Km: 6.0,
    batteryKwh: 18,
    builtIn: true,
  },
  {
    // Range is the owner's real-world figure (WLTP says 57 km). Electric consumption is
    // the EU spec (18.4 kWh/100 km); petrol is the EPA charge-sustaining rating (34 mpg).
    id: "kia-sorento-phev-2021",
    name: "Kia Sorento PHEV 2021 (13,8 kWh)",
    maxEvRangeKm: 42,
    evConsumptionPer100Km: 18.4,
    iceConsumptionPer100Km: 6.9,
    batteryKwh: 13.8,
    builtIn: true,
  },
];

const STORAGE_KEY = "phev-calc-cars";

// localStorage can be unavailable (private mode, blocked storage), so every access is guarded.
export function loadCustomCars(): CarPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CarPreset[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomCars(cars: CarPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
  } catch {
    // Ignore: the car just won't persist across reloads.
  }
}
