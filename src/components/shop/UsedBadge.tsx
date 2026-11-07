"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/cn";

/** «Б/у» mark for used equipment (card, quick view, product page). */
export function UsedBadge({ className, large = false }: { className?: string; large?: boolean }) {
  const t = useTranslation();
  return (
    <span
      title={t("product.usedHint")}
      className={cn(
        "inline-block rounded bg-accent font-bold uppercase tracking-wide text-ink",
        large ? "px-2.5 py-1 text-xs" : "px-2 py-1 text-[10px]",
        className,
      )}
    >
      {t("product.used")}
    </span>
  );
}
