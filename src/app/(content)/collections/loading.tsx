import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Instant fallback for the collections page: intro block plus the masonry-like
 * tile grid (same `auto-rows-[12rem]` rhythm and every fifth tile doubled), so
 * the layout is already in place when the category counts arrive.
 */

/** Placeholder tiles — the seeded catalog has ten categories. */
const TILE_COUNT = 8;

/** Same rhythm as the page: every fifth tile spans 2×2. */
const span = (i: number) => (i % 5 === 0 ? "sm:col-span-2 sm:row-span-2" : "");

export default function CollectionsLoading() {
  return (
    <div aria-busy="true" className="container-page flex-1 py-12">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mb-3 mt-2 h-10 w-80 max-w-full md:h-12" />
      <div className="max-w-xl space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="mt-10 grid auto-rows-[12rem] grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <div
            key={i}
            className={`flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone bg-gradient-to-br from-mist to-paper p-6 ${span(i)}`}
          >
            <Skeleton className="h-3 w-20 bg-stone" />
            <div>
              <Skeleton className="h-6 w-3/4 bg-stone" />
              <Skeleton className="mt-2 h-4 w-24 bg-stone" />
              <Skeleton className="mt-2 h-3 w-20 bg-stone" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
