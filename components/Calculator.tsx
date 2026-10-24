"use client";

import { useMemo, useState } from "react";
import { calculateTrip } from "@/lib/calculator";
import { BUILT_IN_CARS } from "@/lib/cars";
import { ASSISTANT_ENABLED } from "@/lib/features";
import { parseDecimal } from "@/lib/format";
import { AssistantSection } from "./AssistantSection";
import { CarSection, carToFields, type CarFields } from "./CarSection";
import { ResultsSection } from "./ResultsSection";
import { TripSection, type TripFields } from "./TripSection";

const DEFAULT_TRIP: TripFields = {
  distanceKm: "85,4",
  pricePerKwh: "0,52",
  pricePerLitre: "1,99",
};

export function Calculator() {
  const [trip, setTrip] = useState<TripFields>(DEFAULT_TRIP);
  const [car, setCar] = useState<CarFields>(() => carToFields(BUILT_IN_CARS[0]));
  const [carName, setCarName] = useState(BUILT_IN_CARS[0].name);

  const pricePerKwh = parseDecimal(trip.pricePerKwh);

  const result = useMemo(() => {
    const values = {
      distanceKm: parseDecimal(trip.distanceKm),
      pricePerKwh: parseDecimal(trip.pricePerKwh),
      pricePerLitre: parseDecimal(trip.pricePerLitre),
      maxEvRangeKm: parseDecimal(car.maxEvRangeKm),
      evConsumptionPer100Km: parseDecimal(car.evConsumptionPer100Km),
      iceConsumptionPer100Km: parseDecimal(car.iceConsumptionPer100Km),
    };
    const valid = Object.values(values).every((v) => Number.isFinite(v) && v >= 0);
    if (!valid || values.evConsumptionPer100Km === 0) return null;

    return calculateTrip(values, values);
  }, [trip, car]);

  const toNumberOrNull = (value: string) => {
    const n = parseDecimal(value);
    return Number.isFinite(n) ? n : null;
  };
  const assistantContext = {
    carName,
    distanceKm: toNumberOrNull(trip.distanceKm),
    pricePerKwh: toNumberOrNull(trip.pricePerKwh),
    pricePerLitre: toNumberOrNull(trip.pricePerLitre),
    maxEvRangeKm: toNumberOrNull(car.maxEvRangeKm),
    evConsumptionPer100Km: toNumberOrNull(car.evConsumptionPer100Km),
    iceConsumptionPer100Km: toNumberOrNull(car.iceConsumptionPer100Km),
    batteryKwh: toNumberOrNull(car.batteryKwh),
  };

  return (
    <>
      <TripSection values={trip} onChange={setTrip} />
      <CarSection values={car} onChange={setCar} onCarLoaded={setCarName} />
      <ResultsSection result={result} pricePerKwh={pricePerKwh} />
      {ASSISTANT_ENABLED && <AssistantSection context={assistantContext} />}
    </>
  );
}
