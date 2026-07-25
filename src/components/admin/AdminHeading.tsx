"use client";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Translated page heading for the admin sub-pages. Server pages render this so
 * the title follows the language switch without becoming client components.
 */
export function AdminHeading({
  tKey,
  vars,
}: {
  tKey: string;
  vars?: Record<string, string | number>;
}) {
  const t = useTranslation();

  return (
    <h2 className="mb-6 text-xl font-black uppercase">
      {vars ? t(tKey, vars) : t(tKey)}
    </h2>
  );
}
