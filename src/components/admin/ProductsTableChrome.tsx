"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { formatProductCount } from "@/i18n/translations";

/** Product count + "new product" action above the admin products table. */
export function ProductsToolbar({ count }: { count: number }) {
  const t = useTranslation();

  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-sm text-ink-soft">
        {formatProductCount(t.locale, count)}
      </p>
      <Link
        href="/admin/products/new"
        className="hover-lift rounded-full bg-accent px-5 py-2.5 text-xs font-bold uppercase text-ink"
      >
        {t("admin.newProduct")}
      </Link>
    </div>
  );
}

/** Header row of the admin products table. */
export function ProductsTableHead() {
  const t = useTranslation();

  return (
    <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
      <tr>
        <th className="px-4 py-3">{t("admin.name")}</th>
        <th className="px-4 py-3">{t("admin.category")}</th>
        <th className="px-4 py-3">{t("admin.price")}</th>
        <th className="px-4 py-3">{t("admin.stock")}</th>
        <th className="px-4 py-3 text-right">{t("admin.actions")}</th>
      </tr>
    </thead>
  );
}
