const OPERATORS = new Set([
  "39",
  "50",
  "63",
  "66",
  "67",
  "68",
  "73",
  "75",
  "77",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
]);

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

/** Повертає 380XXXXXXXXX або null. */
export function normalizeUaPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("380") && digits.length === 12) {
    // already canonical
  } else if (digits.startsWith("80") && digits.length === 11) {
    digits = `3${digits}`;
  } else if (digits.startsWith("0") && digits.length === 10) {
    digits = `38${digits}`;
  } else if (digits.length === 9) {
    digits = `380${digits}`;
  } else {
    return null;
  }
  if (!/^380\d{9}$/.test(digits)) return null;
  if (!OPERATORS.has(digits.slice(3, 5))) return null;
  return digits;
}
