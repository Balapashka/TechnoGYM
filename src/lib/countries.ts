/**
 * Sourcing countries of the catalog. `originCountry` is stored in Russian
 * (see prisma/seed.ts); URLs and translations key off the stable code.
 * Adding a new sourcing country means adding a row here and a label in
 * src/i18n/translations.ts `countries`.
 */
const CODE_BY_ORIGIN: Record<string, string> = {
  Китай: "cn",
  Италия: "it",
};

const ORIGIN_BY_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(CODE_BY_ORIGIN).map(([origin, code]) => [code, origin]),
);

/** URL code for a stored origin name; null for unmapped origins. */
export function countryCode(originCountry: string): string | null {
  return CODE_BY_ORIGIN[originCountry] ?? null;
}

/** Stored origin name for a URL code; null for unknown codes. */
export function originFromCode(code: string): string | null {
  return ORIGIN_BY_CODE[code] ?? null;
}
