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
  close(r.withBattery.electricKm, 82);
  close(r.withBattery.petrolKm, 3.4);
  close(r.withBattery.kwh, 12.054);
  close(r.withBattery.cost, 12.054 * 0.52 + 0.204 * 1.99);
  close(r.savings, r.petrolOnly.cost - r.withBattery.cost);
  close(r.breakevenPricePerKwh, (6.0 * 1.99) / 14.7);
});

test("trip within the electric range is fully electric", () => {
  const r = calculateTrip({ distanceKm: 50, pricePerKwh: 0.3, pricePerLitre: 2 }, car);

  close(r.withBattery.petrolKm, 0);
  close(r.withBattery.litres, 0);
  close(r.withBattery.cost, 0.5 * 14.7 * 0.3);
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

test("partial battery switches to petrol after the available electric km", () => {
  const r = calculateTrip({ distanceKm: 85.4, pricePerKwh: 0.52, pricePerLitre: 1.99, availableEvKm: 30 }, car);

  close(r.withBattery.electricKm, 30);
  close(r.withBattery.petrolKm, 55.4);
  close(r.withBattery.kwh, 0.3 * 14.7);
  close(r.withBattery.litres, 0.554 * 6.0);
  close(r.withBattery.cost, 0.3 * 14.7 * 0.52 + 0.554 * 6.0 * 1.99);
});

test("available electric km are capped at the max range and at zero", () => {
  const over = calculateTrip({ distanceKm: 200, pricePerKwh: 0.52, pricePerLitre: 1.99, availableEvKm: 500 }, car);
  close(over.withBattery.availableEvKm, 82);
  close(over.withBattery.electricKm, 82);

  const empty = calculateTrip({ distanceKm: 50, pricePerKwh: 0.52, pricePerLitre: 1.99, availableEvKm: 0 }, car);
  close(empty.withBattery.cost, empty.petrolOnly.cost);
  close(empty.savings, 0);
});
