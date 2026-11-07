/**
 * Known brands and how they are sold. Picking one in the admin product form
 * fills in the country, availability and price-on-request for the owner.
 */
export type BrandPreset = {
  name: string;
  originCountry: string;
  inStock: boolean;
  priceOnRequest: boolean;
};

export const BRAND_PRESETS: BrandPreset[] = [
  { name: "Technogym", originCountry: "Италия", inStock: false, priceOnRequest: true },
  { name: "UNIX Fit", originCountry: "Китай", inStock: true, priceOnRequest: false },
];

export function brandPreset(name: string): BrandPreset | null {
  const n = name.trim().toLowerCase();
  return BRAND_PRESETS.find((b) => b.name.toLowerCase() === n) ?? null;
}
