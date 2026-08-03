import { cn } from "@/lib/cn";

/**
 * Loading placeholder block used by every `loading.tsx` skeleton screen.
 *
 * Purely decorative: it carries `aria-hidden` so a screen reader never
 * announces the empty shapes that stand in for the real content. The pulse is
 * `motion-safe:` only — with `prefers-reduced-motion: reduce` the block stays a
 * flat `mist` rectangle instead of animating forever while the route streams.
 *
 * Pass sizing/shape through `className` (e.g. `h-4 w-1/3`, `aspect-square
 * rounded-none`); it is merged last so it wins over the defaults.
 *
 * Filled with `stone`, not `mist`: `mist` on `paper` is a 1.12:1 contrast and
 * all but disappears on a phone screen outdoors — an invisible skeleton reads
 * as a blank page, which is the very thing it exists to prevent.
 */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn("rounded-md bg-stone motion-safe:animate-pulse", className)}
    />
  );
}
