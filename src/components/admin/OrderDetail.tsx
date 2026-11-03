"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus, orderStatusLabel } from "@/i18n/translations";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/order-format";
import { phoneHref } from "@/lib/settings-shape";
import { cn } from "@/lib/cn";
import { ORDER_STATUS_STYLE } from "./OrdersTable";

export type OrderDetailData = {
  id: string;
  number: string;
  createdAtLabel: string;
  status: string;
  email: string;
  customerName: string;
  phone: string;
  deliveryMethod: string;
  addressLine: string;
  comment: string | null;
  paymentMethod: string;
  paymentId: string | null;
  adminNote: string;
  totalCents: number;
  currency: string;
  registered: boolean;
  items: {
    id: string;
    name: string;
    variantName: string | null;
    quantity: number;
    priceCents: number;
    /** Null once the product was deleted from the catalog. */
    slug: string | null;
  }[];
};

/** Order card for the manager: contents, contacts, delivery, status control. */
export function OrderDetail({ order }: { order: OrderDetailData }) {
  const t = useTranslation();
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState(order.adminNote);
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: note, notifyCustomer: notify }),
    }).catch(() => null);
    setSaving(false);
    if (res?.ok) {
      setMessage({ ok: true, text: t("admin.saved") });
      router.refresh();
    } else {
      setMessage({ ok: false, text: t(errorKeyForStatus(res?.status ?? 500)) });
    }
  }

  const box = "rounded-2xl border border-stone p-5";
  const h = "mb-3 text-xs font-bold uppercase tracking-widest text-ink-soft";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-ink-soft underline">
            {t("admin.backToOrders")}
          </Link>
          <h2 className="mt-2 text-2xl font-black uppercase">
            {t("admin.orderTitle", { number: order.number })}
          </h2>
          <p className="text-sm text-ink-soft">{order.createdAtLabel}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold uppercase",
            ORDER_STATUS_STYLE[order.status] ?? "bg-mist",
          )}
        >
          {orderStatusLabel(t.locale, order.status)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className={box}>
            <p className={h}>{t("admin.items")}</p>
            <ul className="divide-y divide-stone text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-2">
                  <span>
                    {i.slug ? (
                      <Link href={`/product/${i.slug}`} target="_blank" className="underline">
                        {i.name}
                      </Link>
                    ) : (
                      i.name
                    )}
                    {i.variantName && <span className="text-ink-soft"> · {i.variantName}</span>}
                    <span className="text-ink-soft">
                      {" "}
                      × {i.quantity} · {formatPrice(i.priceCents, order.currency)}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-semibold">
                    {formatPrice(i.priceCents * i.quantity, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-stone pt-3 font-black">
              <span>{t("admin.total")}</span>
              <span>{formatPrice(order.totalCents, order.currency)}</span>
            </div>
          </section>

          <section className={cn(box, "grid gap-6 sm:grid-cols-2")}>
            <div>
              <p className={h}>{t("admin.contacts")}</p>
              <p className="font-semibold">{order.customerName || "—"}</p>
              {order.phone && (
                <a href={phoneHref(order.phone)} className="block underline">
                  {order.phone}
                </a>
              )}
              <a href={`mailto:${order.email}`} className="block break-all underline">
                {order.email}
              </a>
            </div>
            <div>
              <p className={h}>{t("admin.deliveryAddress")}</p>
              <p>
                {order.deliveryMethod === "pickup"
                  ? t("admin.pickup")
                  : order.addressLine || "—"}
              </p>
              <p className="mt-3 text-sm text-ink-soft">
                {t("admin.payment")}:{" "}
                {order.paymentMethod === "online"
                  ? t("admin.payOnline")
                  : t("admin.payManual")}
                {order.paymentId && (
                  <span className="block font-mono text-xs">ЮKassa: {order.paymentId}</span>
                )}
              </p>
            </div>
            {order.comment && (
              <div className="sm:col-span-2">
                <p className={h}>{t("admin.customerComment")}</p>
                <p className="whitespace-pre-line">{order.comment}</p>
              </div>
            )}
          </section>
        </div>

        <section className={cn(box, "h-fit space-y-4")}>
          <div>
            <label htmlFor="order-status" className={h}>
              {t("admin.status")}
            </label>
            <select
              id="order-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone px-3 py-2 text-sm"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {orderStatusLabel(t.locale, s)}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="mt-0.5 accent-ink"
            />
            {t("admin.notifyCustomer")}
          </label>
          <div>
            <label htmlFor="order-note" className={h}>
              {t("admin.adminNote")}
            </label>
            <textarea
              id="order-note"
              rows={4}
              value={note}
              maxLength={2000}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="hover-lift w-full rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
          >
            {saving ? t("admin.saving") : t("admin.save")}
          </button>
          {message && (
            <p className={cn("text-sm", message.ok ? "text-green-700" : "text-red-600")}>
              {message.text}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
