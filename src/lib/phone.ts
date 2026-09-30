export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

function nationalDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  while (digits.startsWith("380") || digits.startsWith("80") || digits.startsWith("0")) {
    if (digits.startsWith("380")) digits = digits.slice(3);
    else if (digits.startsWith("80")) digits = digits.slice(2);
    else digits = digits.slice(1);
  }
  return digits.slice(0, 9);
}

/** Поле показує +380 67 123 45 67. Порожній набір цифр лишає префікс. */
export function formatUaPhone(value: string): string {
  const digits = nationalDigits(value);
  const a = digits.slice(0, 2);
  const b = digits.slice(2, 5);
  const c = digits.slice(5, 7);
  const e = digits.slice(7, 9);
  let out = "+380";
  if (a) out += ` ${a}`;
  if (b) out += ` ${b}`;
  if (c) out += ` ${c}`;
  if (e) out += ` ${e}`;
  return digits.length === 0 ? "+380 " : out;
}

/** Повертає 380XXXXXXXXX або null, якщо після зрізання 0/80/380 не лишилось рівно 9 цифр. */
export function normalizeUaPhone(input: string): string | null {
  const national = nationalDigits(input);
  if (national.length !== 9) return null;
  return `380${national}`;
}
