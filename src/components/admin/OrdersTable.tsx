"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { orderStatusLabel } from "@/i18n/translations";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/order-format";
import { cn } from "@/lib/cn";
import { phoneHref } from "@/lib/settings-shape";

export type OrderRow = {
  id: string;
  number: string;
  createdAtLabel: string;
  customer: string;
  phone: string;
  totalCents: number;
  currency: string;
  status: string;
  paymentMethod: string;
  deliveryMethod: string;
  city: string;
};

export const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-mist text-ink",
  CANCELLED: "bg-red-100 text-red-700",
};

/** Orders list with status tabs. Rows link to the order card. */
export function OrdersTable({
  rows,
  filter,
  counts,
}: {
  rows: OrderRow[];
  filter: string | null;
  counts: Record<string, number>;
}) {
  const t = useTranslation();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const tab = (href: string, label: string, count: number, active: boolean) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-bold uppercase",
        active ? "border-ink bg-ink text-paper" : "border-stone hover:bg-mist",
      )}
    >
      {label} <span className="opacity-60">{count}</span>
    </Link>
  );

  return (
    <div>
      <h2 className="mb-4 text-xl font-black uppercase">{t("admin.orders")}</h2>
      <div className="mb-5 flex flex-wrap gap-2">
        {tab("/admin/orders", t("admin.allStatuses"), total, filter === null)}
        {ORDER_STATUSES.map((s) =>
          tab(
            `/admin/orders?status=${s}`,
            orderStatusLabel(t.locale, s),
            counts[s] ?? 0,
            filter === s,
          ),
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone p-10 text-center">
          <p className="text-ink-soft">{t("admin.noOrders")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">{t("admin.orderNo")}</th>
                  <th className="px-4 py-3">{t("admin.date")}</th>
                  <th className="px-4 py-3">{t("admin.customer")}</th>
                  <th className="px-4 py-3">{t("admin.deliveryMethod")}</th>
                  <th className="px-4 py-3">{t("admin.payment")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.total")}</th>
                  <th className="px-4 py-3">{t("admin.status")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-stone align-top transition hover:bg-mist">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${r.id}`}
                        className="font-mono font-bold underline hover:text-ink-soft"
                      >
                        {r.number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                      {r.createdAtLabel}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold">{r.customer}</span>
                      {r.phone && (
                        <a href={phoneHref(r.phone)} className="text-ink-soft underline">
                          {r.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.deliveryMethod === "pickup"
                        ? t("admin.pickup")
                        : `${t("admin.courier")}${r.city ? `, ${r.city}` : ""}`}
                    </td>
                    <td className="px-4 py-3">
                      {r.paymentMethod === "online"
                        ? t("admin.payOnline")
                        : t("admin.payManual")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold">
                      {formatPrice(r.totalCents, r.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-bold uppercase",
                          ORDER_STATUS_STYLE[r.status] ?? "bg-mist",
                        )}
                      >
                        {orderStatusLabel(t.locale, r.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
