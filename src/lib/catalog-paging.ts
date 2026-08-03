/**
 * How much of a catalog listing is drawn at once.
 *
 * Only the *markup* is paged — filtering, sorting and the facet counts keep
 * running over the whole listing. A card is by far the heaviest thing on a
 * product listing page (image, price, quick view, compare), and
 * `/category/all` holds ~180 of them: drawing them all at once is what made a
 * catalog navigation feel frozen even though the server answered in a few ms.
 */
export const PAGE_SIZE = 24;

/**
 * How far the grid has been expanded, tagged with the filter state it was
 * expanded under. Storing the two together lets the limit fall back to the
 * first chunk on any filter/sort/country change without an effect or a
 * remount — a stale expansion simply stops matching the current query.
 */
export type Expansion = { queryKey: string; extra: number };

/** The expansion a freshly opened listing starts from. */
export const initialExpansion = (queryKey: string): Expansion => ({
  queryKey,
  extra: 0,
});

/** How many cards the grid may draw for `queryKey`. */
export function chunkLimit(expansion: Expansion, queryKey: string): number {
  return (expansion.queryKey === queryKey ? expansion.extra : 0) + PAGE_SIZE;
}

/** The expansion produced by pressing "show more" at `limit`. */
export const expandBy = (queryKey: string, limit: number): Expansion => ({
  queryKey,
  extra: limit,
});
