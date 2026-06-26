import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-paper",
        className,
      )}
    >
      {children}
    </span>
  );
}
