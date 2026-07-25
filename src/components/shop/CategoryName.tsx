"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { categoryName } from "@/i18n/translations";

/**
 * Renders a category name in the current language. Category names are stored
 * in English in the DB, so server components pass the DB value as `fallback`.
 */
export function CategoryName({
  slug,
  fallback,
}: {
  slug: string;
  fallback?: string;
}) {
  const t = useTranslation();
  return <>{categoryName(t.locale, slug, fallback)}</>;
}
