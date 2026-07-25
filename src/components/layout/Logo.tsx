import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getMedia } from "@/lib/media";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Brand logo, always linking back to the homepage. Renders the asset from the
 * `logo` media slot when one is configured, otherwise a text wordmark.
 */
export function Logo({ className }: { className?: string }) {
  const slot = getMedia("logo");

  return (
    <Link
      href="/"
      aria-label={BRAND_NAME}
      className={cn("inline-flex items-center", className)}
    >
      {slot.src ? (
        <Image
          src={slot.src}
          alt={BRAND_NAME}
          width={slot.width}
          height={slot.height}
          priority
          className="h-9 w-auto rounded-sm"
        />
      ) : (
        <span className="rounded bg-accent px-2 py-1 text-lg font-black uppercase tracking-tight text-ink">
          {BRAND_NAME}
        </span>
      )}
    </Link>
  );
}
