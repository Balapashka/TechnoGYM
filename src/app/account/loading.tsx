import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Instant fallback for the account page. Mirrors AccountView: greeting block,
 * order-history heading and a few order cards, inside the same
 * `container-page py-12` frame.
 *
 * The admin shortcut is intentionally absent — it only renders for ADMINs, so
 * standing it in would make the header shift for everyone else.
 */
export default function AccountLoading() {
  return (
    <div aria-busy="true" className="container-page flex-1 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-10 w-72 max-w-full" />
          <Skeleton className="mt-1 h-4 w-48" />
        </div>
      </div>

      <Skeleton className="mb-4 mt-10 h-5 w-48" />

      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-stone p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {[0, 1].map((j) => (
                <div key={j} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
