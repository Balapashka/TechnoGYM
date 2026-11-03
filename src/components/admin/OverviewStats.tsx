"use client";

import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { useTranslation } from "@/i18n/useTranslation";
import type { SettingsKey } from "@/lib/settings-shape";
import { cn } from "@/lib/cn";

/**
 * Admin dashboard: launch checklist warnings, key numbers and integration
 * status. Everything is computed on the server; only labels live here.
 */
export function OverviewStats({
  products,
  newOrders,
  orders,
  newLeads,
  users,
  revenue,
  missingSettings,
  integrations,
  testMode,
}: {
  products: number;
  newOrders: number;
  orders: number;
  newLeads: number;
  users: number;
  /** Already formatted with formatPrice() on the server. */
  revenue: string;
  missingSettings: SettingsKey[];
  integrations: { telegram: boolean; email: boolean; payments: boolean; indexing: boolean };
  testMode: boolean;
}) {
  const t = useTranslation();

  const stats: { label: string; value: string | number; href: string; hot?: boolean }[] = [
    { label: t("admin.newOrders"), value: newOrders, href: "/admin/orders?status=PENDING", hot: newOrders > 0 },
    { label: t("admin.newLeads"), value: newLeads, href: "/admin/quote-requests", hot: newLeads > 0 },
    { label: t("admin.orders"), value: orders, href: "/admin/orders" },
    { label: t("admin.revenue"), value: revenue, href: "/admin/orders" },
    { label: t("admin.products"), value: products, href: "/admin/products" },
    { label: t("admin.customers"), value: users, href: "/admin" },
  ];

  const ints: { label: string; on: boolean }[] = [
    { label: t("admin.intTelegram"), on: integrations.telegram },
    { label: t("admin.intEmail"), on: integrations.email },
    { label: t("admin.intPayments"), on: integrations.payments },
    { label: t("admin.intIndexing"), on: integrations.indexing },
  ];

  return (
    <div className="space-y-8">
      {missingSettings.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm">
          <p className="font-bold">{t("admin.launchWarning")}</p>
          <p className="mt-1 text-ink-soft">
            {missingSettings.map((k) => t(`admin.setting_${k}`)).join(", ")}
          </p>
          <Link
            href="/admin/settings"
            className="mt-3 inline-block font-bold underline"
          >
            {t("admin.goToSettings")}
          </Link>
        </div>
      )}
      {testMode && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-800">
          {t("admin.testModeWarning")}
        </div>
      )}

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Link
              href={s.href}
              className={cn(
                "hover-lift block rounded-2xl border p-5",
                s.hot ? "border-ink bg-accent/30" : "border-stone",
              )}
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
          href="/admin/settings"
          className="hover-lift rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
        >
          {t("admin.settings")}
        </Link>
      </div>

      <section className="rounded-2xl border border-stone p-5">
        <h3 className="mb-3 text-sm font-black uppercase">{t("admin.integrations")}</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ints.map((i) => (
            <li key={i.label} className="flex items-center justify-between gap-3 text-sm">
              <span>{i.label}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase",
                  i.on ? "bg-green-100 text-green-800" : "bg-mist text-ink-soft",
                )}
              >
                {i.on ? t("admin.intOn") : t("admin.intOff")}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-soft">{t("admin.intHint")}</p>
      </section>
    </div>
  );
}
