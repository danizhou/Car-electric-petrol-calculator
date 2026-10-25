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
    // Real-world figures rather than WLTP (57 km, 18.4 kWh/100 km): range is the owner's,
    // electric is mixed driving (16.5 city to 24 motorway), petrol is the depleted-battery average.
    id: "kia-sorento-phev-2021",
    name: "Kia Sorento PHEV 2021 (13,8 kWh)",
    maxEvRangeKm: 42,
    evConsumptionPer100Km: 22,
    iceConsumptionPer100Km: 7.5,
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
