const LOCALE = "it-IT";

const currency = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR" });

export const formatEuro = (value: number) => currency.format(value);

export const formatNumber = (value: number, digits = 2) =>
  value.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Parses user input, accepting both "1,99" and "1.99". Returns NaN when invalid. */
export function parseDecimal(input: string): number {
  const normalized = input.trim().replace(",", ".");
  return normalized === "" ? NaN : Number(normalized);
}

/** Renders a number for an input field without forcing trailing zeros. */
export const toInputValue = (value: number | null) =>
  value == null ? "" : value.toLocaleString(LOCALE, { maximumFractionDigits: 3 });
