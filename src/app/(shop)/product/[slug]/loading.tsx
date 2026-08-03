import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Instant fallback for a PDP. Mirrors the real two-column layout — gallery on
 * the left, title / price / purchase bar on the right — inside the same
 * `container-page py-8` frame, so the swap to real content is jump-free.
 */
export default function ProductLoading() {
  return (
    <main aria-busy="true" className="container-page flex-1 py-8">
      {/* Breadcrumb */}
      <Skeleton className="mb-6 h-3 w-72 max-w-full" />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Title, description, specs, purchase bar */}
        <div className="flex flex-col gap-6">
          <div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-8 w-4/5 md:h-10" />
            <Skeleton className="mt-2 h-4 w-40" />
            <Skeleton className="mt-3 h-4 w-32" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>

          {/* ProductSpecs */}
          <div className="rounded-xl border border-stone p-4">
            <Skeleton className="mb-3 h-3 w-24" />
            <div className="grid gap-2">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-baseline justify-between gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* AddToCart: variants + sticky purchase bar */}
          <div className="space-y-6">
            <div>
              <Skeleton className="mb-2 h-3 w-32" />
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10 w-28 rounded" />
                ))}
              </div>
            </div>

            <div className="-mx-4 border-t border-stone px-4 py-4 md:mx-0 md:rounded md:border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-12 w-44 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
