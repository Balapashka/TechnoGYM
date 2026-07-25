"use client";

import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Admin dashboard tiles + quick actions. Counts are computed on the server and
 * passed in; only the labels live here so they follow the language switch.
 */
export function OverviewStats({
  products,
  categories,
  orders,
  users,
  revenue,
}: {
  products: number;
  categories: number;
  orders: number;
  users: number;
  /** Already formatted with formatPrice() on the server. */
  revenue: string;
}) {
  const t = useTranslation();

  const stats: { label: string; value: string | number; href: string }[] = [
    { label: t("admin.products"), value: products, href: "/admin/products" },
    {
      label: t("admin.categories"),
      value: categories,
      href: "/admin/categories",
    },
    { label: t("account.orderHistory"), value: orders, href: "/account" },
    { label: t("common.account"), value: users, href: "/admin" },
    { label: t("product.total"), value: revenue, href: "/admin" },
  ];

  return (
    <div className="space-y-8">
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Link
              href={s.href}
              className="hover-lift block rounded-2xl border border-stone p-5"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-black">{s.value}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("admin.newProduct")}
        </Link>
        <Link
          href="/admin/categories"
          className="hover-lift rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
        >
          {t("admin.categories")}
        </Link>
      </div>
    </div>
  );
}
