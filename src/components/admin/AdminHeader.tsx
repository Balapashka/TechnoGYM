"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/cn";

/** Section tabs for the admin console. Labels come from the dictionary. */
const tabs: { href: string; key: string }[] = [
  { href: "/admin", key: "admin.overview" },
  { href: "/admin/orders", key: "admin.orders" },
  { href: "/admin/quote-requests", key: "admin.quoteRequests" },
  { href: "/admin/products", key: "admin.products" },
  { href: "/admin/categories", key: "admin.categories" },
  { href: "/admin/subscribers", key: "admin.subscribers" },
  { href: "/admin/settings", key: "admin.settings" },
];

/**
 * Title block + section nav for /admin. Client-side so the admin console
 * follows the language switch (the layout itself stays a server component
 * because it guards the route with the session).
 */
export function AdminHeader() {
  const t = useTranslation();
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

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
      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive(tab.href) ? "page" : undefined}
            className={cn(
              "hover-lift rounded-full border px-4 py-2 text-xs font-bold uppercase",
              isActive(tab.href)
                ? "border-ink bg-ink text-paper"
                : "border-stone hover:bg-mist",
            )}
          >
            {t(tab.key)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
