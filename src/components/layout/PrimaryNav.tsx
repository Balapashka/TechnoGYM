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
          className="nav-underline py-2 text-sm font-semibold uppercase tracking-wide"
        >
          {t(item.key)}
        </Link>
      ))}
    </>
  );
}

/** "For business" header link. */
export function BusinessLink() {
  const t = useTranslation();

  return (
    <Link
      href="/business"
      className="nav-underline hidden uppercase tracking-wide md:max-lg:inline xl:inline"
    >
      {t("common.forBusiness")}
    </Link>
  );
}
