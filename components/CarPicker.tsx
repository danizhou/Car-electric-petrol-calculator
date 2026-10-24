"use client";

import { useEffect, useRef } from "react";
import type { CarPreset } from "@/lib/cars";
import { formatNumber } from "@/lib/format";

interface CarPickerProps {
  cars: CarPreset[];
  onPick: (car: CarPreset) => void;
}

/** Modal shown on entry: the user must choose a car before using the calculator. */
export function CarPicker({ cars, onPick }: CarPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const pick = (car: CarPreset) => {
    dialogRef.current?.close();
    onPick(car);
  };

  return (
    // Escape is blocked so a car is always chosen.
    <dialog ref={dialogRef} className="car-picker" aria-labelledby="car-picker-title" onCancel={(e) => e.preventDefault()}>
      <h2 id="car-picker-title">Quale auto usi?</h2>
      <p className="note">Potrai cambiarla o modificarne i valori in qualsiasi momento.</p>
      <ul>
        {cars.map((car) => (
          <li key={car.id}>
            <button type="button" className="ghost" onClick={() => pick(car)}>
              <strong>{car.name}</strong>
              <span>
                {formatNumber(car.maxEvRangeKm, 0)} km elettrici · {formatNumber(car.evConsumptionPer100Km, 1)} kWh/100 km ·{" "}
                {formatNumber(car.iceConsumptionPer100Km, 1)} L/100 km
              </span>
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
