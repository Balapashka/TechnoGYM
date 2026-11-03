"use client";

import Link from "next/link";
import { primaryNav } from "@/lib/nav";
import { useTranslation } from "@/i18n/useTranslation";

/** Top-level header links (client-side so they follow the language switch). */
export function PrimaryNav() {
  const t = useTranslation();

  return (
    <>
      {primaryNav.map((item) => (
        <Link
          key={item.href + item.key}
          href={item.href}
          className="nav-underline whitespace-nowrap py-2 text-sm font-semibold uppercase tracking-wide"
        >
          {t(item.key)}
        </Link>
      ))}
    </>
  );
}
