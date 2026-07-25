/**
 * Helpers for the SQLite JSON-string workaround.
 * Product.images / Product.features are stored as JSON strings because SQLite
 * does not support scalar list columns in Prisma.
 */

/** Serialize a string array into a JSON column value. */
export function packList(list: string[]): string {
  return JSON.stringify(list);
}

/** Parse a JSON column value back into a string array. Safe on bad input. */
export function unpackList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
