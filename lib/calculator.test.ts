import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTrip, type CarSpec } from "./calculator.ts";

const car: CarSpec = {
  maxEvRangeKm: 82,
  evConsumptionPer100Km: 14.7,
  iceConsumptionPer100Km: 6.0,
};

const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} !== ${expected}`);

test("trip longer than the electric range uses petrol for the remainder", () => {
  const r = calculateTrip({ distanceKm: 85.4, pricePerKwh: 0.52, pricePerLitre: 1.99 }, car);

  close(r.petrolOnly.litres, 5.124);
  close(r.petrolOnly.cost, 5.124 * 1.99);
  close(r.fullBattery.electricKm, 82);
  close(r.fullBattery.petrolKm, 3.4);
  close(r.fullBattery.kwh, 12.054);
  close(r.fullBattery.cost, 12.054 * 0.52 + 0.204 * 1.99);
  close(r.savings, r.petrolOnly.cost - r.fullBattery.cost);
  close(r.breakevenPricePerKwh, (6.0 * 1.99) / 14.7);
});

test("trip within the electric range is fully electric", () => {
  const r = calculateTrip({ distanceKm: 50, pricePerKwh: 0.3, pricePerLitre: 2 }, car);

  close(r.fullBattery.petrolKm, 0);
  close(r.fullBattery.litres, 0);
  close(r.fullBattery.cost, 0.5 * 14.7 * 0.3);
});

test("expensive electricity yields negative savings", () => {
  const r = calculateTrip({ distanceKm: 50, pricePerKwh: 1.5, pricePerLitre: 1.99 }, car);

  assert.ok(r.savings < 0);
  assert.ok(r.savingsPercent < 0);
});

test("zero distance does not divide by zero", () => {
  const r = calculateTrip({ distanceKm: 0, pricePerKwh: 0.5, pricePerLitre: 2 }, car);

  assert.equal(r.savingsPercent, 0);
});
