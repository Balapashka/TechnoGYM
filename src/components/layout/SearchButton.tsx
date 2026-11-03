"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

/** Header magnifier linking to /search. */
export function SearchButton() {
  const t = useTranslation();
  return (
    <Link
      href="/search"
      aria-label={t("search.openSearch")}
      title={t("search.openSearch")}
      className="inline-flex items-center hover:text-ink-soft"
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
