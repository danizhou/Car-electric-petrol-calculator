export interface TripInput {
  /** Total trip distance in km. */
  distanceKm: number;
  /** Electricity price in €/kWh. */
  pricePerKwh: number;
  /** Petrol price in €/L. */
  pricePerLitre: number;
}

export interface CarSpec {
  /** Maximum electric range in km. */
  maxEvRangeKm: number;
  /** Electric consumption in kWh/100 km. */
  evConsumptionPer100Km: number;
  /** Petrol consumption in L/100 km. */
  iceConsumptionPer100Km: number;
}

export interface TripResult {
  /** Scenario A: whole trip on petrol (empty battery). */
  petrolOnly: {
    litres: number;
    cost: number;
  };
  /** Scenario B: start with a full battery, petrol for any remaining km. */
  fullBattery: {
    electricKm: number;
    kwh: number;
    petrolKm: number;
    litres: number;
    cost: number;
  };
  savings: number;
  /** Savings as a percentage of the petrol-only cost. */
  savingsPercent: number;
  petrolCostPer100Km: number;
  /** Highest electricity price (€/kWh) at which driving electric still pays off. */
  breakevenPricePerKwh: number;
}

export function calculateTrip(trip: TripInput, car: CarSpec): TripResult {
  const { distanceKm, pricePerKwh, pricePerLitre } = trip;
  const { maxEvRangeKm, evConsumptionPer100Km, iceConsumptionPer100Km } = car;

  const petrolOnlyLitres = (distanceKm / 100) * iceConsumptionPer100Km;
  const petrolOnlyCost = petrolOnlyLitres * pricePerLitre;

  const electricKm = Math.min(distanceKm, maxEvRangeKm);
  const petrolKm = Math.max(0, distanceKm - maxEvRangeKm);
  const kwh = (electricKm / 100) * evConsumptionPer100Km;
  const extraLitres = (petrolKm / 100) * iceConsumptionPer100Km;
  const fullBatteryCost = kwh * pricePerKwh + extraLitres * pricePerLitre;

  const savings = petrolOnlyCost - fullBatteryCost;
  const savingsPercent = petrolOnlyCost > 0 ? (savings / petrolOnlyCost) * 100 : 0;

  const petrolCostPer100Km = iceConsumptionPer100Km * pricePerLitre;
  const breakevenPricePerKwh =
    evConsumptionPer100Km > 0 ? petrolCostPer100Km / evConsumptionPer100Km : Infinity;

  return {
    petrolOnly: { litres: petrolOnlyLitres, cost: petrolOnlyCost },
    fullBattery: { electricKm, kwh, petrolKm, litres: extraLitres, cost: fullBatteryCost },
    savings,
    savingsPercent,
    petrolCostPer100Km,
    breakevenPricePerKwh,
  };
}
