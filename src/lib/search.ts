/**
 * Catalog search. Pure and in-memory: the catalog is a few hundred rows, and
 * SQLite's LIKE is case-insensitive only for ASCII, so Cyrillic matching is
 * done here instead of in SQL.
 */

export type Searchable = {
  name: string;
  brand: string;
  categoryName: string;
  description: string;
  features: string[];
  slug: string;
};

/** Lower-case, ё→е, punctuation to spaces, collapsed whitespace. */
export function normalizeQuery(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Products matching every word of the query, best matches first: hits in the
 * name outrank brand/category, which outrank description and features.
 * Russian endings are tolerated by matching on the first 5 letters of longer
 * words ("дорожки" finds "дорожка").
 */
export function searchProducts<T extends Searchable>(
  products: T[],
  query: string,
  limit = 60,
): T[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];
  const words = q
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 5 ? w.slice(0, 5) : w));

  const scored: { p: T; score: number }[] = [];
  for (const p of products) {
    const name = normalizeQuery(p.name);
    const meta = normalizeQuery(`${p.brand} ${p.categoryName} ${p.slug}`);
    const body = normalizeQuery(`${p.description} ${p.features.join(" ")}`);
    let score = 0;
    let all = true;
    for (const w of words) {
      if (name.includes(w)) score += 10;
      else if (meta.includes(w)) score += 4;
      else if (body.includes(w)) score += 1;
      else {
        all = false;
        break;
      }
    }
    if (all) scored.push({ p, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}
