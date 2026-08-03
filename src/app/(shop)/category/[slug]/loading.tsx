import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Instant fallback for a PLP. Next.js wraps the page in a Suspense boundary and
 * prefetches this shell, so a click on a category paints immediately while the
 * ~180-product listing streams in; the header, footer and drawers stay
 * interactive throughout.
 *
 * The frame mirrors CatalogHeader + CatalogView one-to-one (same
 * `container-page`, `py-8`/`py-10`, the 16rem filter column and the
 * 2/3-column grid) so nothing jumps when the real content replaces it.
 */

/** Enough cards to cover the fold at both grid widths (2 and 3 columns). */
const CARD_COUNT = 12;

export default function CategoryLoading() {
  return (
    <main aria-busy="true" className="flex flex-1 flex-col">
      {/* CatalogHeader */}
      <div className="border-b border-stone">
        <div className="container-page py-8">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-8 w-64 md:h-10 md:w-96" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      </div>

      {/* CatalogView */}
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden space-y-8 lg:sticky lg:top-24 lg:block lg:h-fit">
          <FilterControlsSkeleton />
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile "filters" button */}
            <Skeleton className="h-10 w-32 rounded-full lg:hidden" />
            {/* Origin switcher */}
            <div className="flex w-full gap-1 rounded-full border border-stone bg-mist p-1 sm:w-auto">
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-8 flex-1 rounded-full bg-stone sm:w-28 sm:flex-none"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
            {Array.from({ length: CARD_COUNT }, (_, i) => (
              // Quote-only products lead every listing, so the first rows get
              // the taller card that includes the quote button.
              <ProductCardSkeleton key={i} quote={i < 6} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Mirrors ProductCard: square media block + origin / name / price / stock.
 *
 * `quote` adds the "Запросить цену" button that quote-only products carry.
 * Those lead every listing (ORIGIN_PRIORITY puts Italy first), so leaving it
 * out made the first cards ~30px short and the grid jumped on hand-off.
 */
function ProductCardSkeleton({ quote = false }: { quote?: boolean }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone bg-paper">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-1 h-4 w-2/5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
        {quote && <Skeleton className="mt-2 h-8 w-full rounded-full" />}
      </div>
    </div>
  );
}

/** Mirrors FilterControls: sort, two facet lists, price slider, stock toggle. */
function FilterControlsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {[4, 3].map((rows, group) => (
        <div key={group}>
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="space-y-2.5">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="mt-1 flex justify-between">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>

      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}
