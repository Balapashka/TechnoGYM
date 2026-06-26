import Link from "next/link";
import { cn } from "@/lib/cn";

/** Text wordmark for the demo brand (no real brand assets). */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center rounded bg-accent px-2 py-1 text-lg font-black uppercase tracking-tight text-ink",
        className,
      )}
    >
      Movigym
    </Link>
  );
}
