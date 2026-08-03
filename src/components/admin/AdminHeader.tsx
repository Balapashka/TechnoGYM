"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

/** Section tabs for the admin console. Labels come from the dictionary. */
const tabs: { href: string; key: string }[] = [
  { href: "/admin", key: "admin.overview" },
  { href: "/admin/products", key: "admin.products" },
  { href: "/admin/categories", key: "admin.categories" },
  { href: "/admin/quote-requests", key: "admin.quoteRequests" },
];

/**
 * Title block + section nav for /admin. Client-side so the admin console
 * follows the language switch (the layout itself stays a server component
 * because it guards the route with the session).
 */
export function AdminHeader() {
  const t = useTranslation();

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
          {t("nav.shop")}
        </p>
        <h1 className="text-3xl font-black uppercase">
          {t("account.adminDashboard")}
        </h1>
      </div>
      <nav className="flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="hover-lift rounded-full border border-stone px-4 py-2 text-xs font-bold uppercase hover:bg-mist"
          >
            {t(tab.key)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
