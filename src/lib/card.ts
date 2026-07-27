/** Pure helpers for the demo card fields: input masks and validation. */

/** Strip everything but digits. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Mask a card number as "4242 4242 4242 4242" (max 16 digits). */
export function formatCardNumber(value: string): string {
  return (
    digitsOnly(value)
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(" ") ?? ""
  );
}

/**
 * Mask an expiry as "ММ/ГГ" while typing. A single digit 2–9 is assumed to be
 * the month and zero-padded ("4" → "04/"), so the slash appears automatically.
 */
export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length === 1) {
    return /[2-9]/.test(digits) ? `0${digits}/` : digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Luhn checksum over a string of digits (spaces allowed). */
export function luhnValid(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length === 0) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/**
 * True if an "ММ/ГГ" expiry is this month or later. Assumes the value already
 * matches the mask; a malformed value returns false.
 */
export function expiryInFuture(value: string, now: Date = new Date()): boolean {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  // The card is valid through the last day of its expiry month.
  return new Date(year, month, 1) > now;
}
