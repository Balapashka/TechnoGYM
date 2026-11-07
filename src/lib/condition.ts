/**
 * New vs used («б/у») equipment. Stored in Product.condition as "new" | "used".
 * Pure — shared by the admin form, CSV import, filters and the storefront.
 */
export type ProductCondition = "new" | "used";

export const CONDITIONS: readonly ProductCondition[] = ["new", "used"];

const USED_WORDS = new Set(["used", "бу", "bu", "спробегом", "бывшийвупотреблении", "уценка"]);

/**
 * What an owner may type in a CSV cell: "б/у", "Б.У.", "бу", "used",
 * "с пробегом" → "used"; empty, "новый", "new" or anything else → "new".
 */
export function parseCondition(raw: string | null | undefined): ProductCondition {
  const key = (raw ?? "").toLowerCase().replace(/[\s./\\-]+/g, "");
  return USED_WORDS.has(key) ? "used" : "new";
}

/** Value for the CSV export: "б/у" for used, blank for new (reads naturally in Excel). */
export function conditionCell(condition: string): string {
  return condition === "used" ? "б/у" : "";
}

export function isProductCondition(v: unknown): v is ProductCondition {
  return v === "new" || v === "used";
}
