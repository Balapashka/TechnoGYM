import { CITIES_BY_COUNTRY } from "../../config/cities";

/**
 * A valid city name: letters of any alphabet (Russian, Kazakh, Uzbek, Latin…)
 * joined by single spaces, hyphens or apostrophes — no digits or other
 * punctuation, no leading or trailing separators ("Ростов-на-Дону",
 * "Өскемен", "Qoʻqon", "L'Aquila").
 */
export const CITY_PATTERN = /^\p{L}+(?:[ '’‘ʻʼ-]\p{L}+)*$/u;

export const CITY_ERROR_MESSAGE =
  "Укажите корректное название города (только буквы)";

/**
 * Live input formatting while the user types: strip leading whitespace,
 * collapse repeated whitespace to a single space and capitalize the first
 * letter. Trailing space is kept so multi-word names stay typeable.
 */
export function formatCityInput(value: string): string {
  const collapsed = value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
  return collapsed.charAt(0).toUpperCase() + collapsed.slice(1);
}

/** Final normalization before validation: live formatting plus a trim. */
export function normalizeCity(value: string): string {
  return formatCityInput(value).trim();
}

/** Autocomplete suggestions for a checkout country; empty for unknown codes. */
export function citiesForCountry(code: string): readonly string[] {
  return CITIES_BY_COUNTRY[code] ?? [];
}
