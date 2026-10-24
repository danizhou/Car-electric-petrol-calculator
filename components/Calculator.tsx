"use client";

import { useMemo, useState } from "react";
import { calculateTrip } from "@/lib/calculator";
import { BUILT_IN_CARS } from "@/lib/cars";
import { parseDecimal } from "@/lib/format";
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

  return (
    <>
      <TripSection values={trip} onChange={setTrip} />
      <CarSection values={car} onChange={setCar} />
      <ResultsSection result={result} pricePerKwh={pricePerKwh} />
    </>
  );
}
