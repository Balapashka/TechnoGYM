import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Instant fallback for the admin console.
 *
 * It renders *inside* `admin/layout.tsx`, so the page frame
 * (`container-page py-10`) and the AdminHeader title/tabs are already on
 * screen — repeating them here would paint a second header and then jump. Only
 * the page body is stood in for: the OverviewStats tiles and quick actions.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-stone p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-9 w-16" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-11 w-44 rounded-full" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>
    </div>
  );
}
