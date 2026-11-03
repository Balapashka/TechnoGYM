"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { errorKeyForStatus } from "@/i18n/translations";
import { Price } from "@/components/ui/Price";

type ResultOrder = {
  id: string;
  number: string;
  status: string;
  email: string;
  totalCents: number;
  currency: string;
  /** Online payment chosen but not (yet) completed. */
  awaitingOnlinePayment: boolean;
};

/** Thank-you / payment status screen shown after checkout. */
export function CheckoutResult({
  order,
  emailSent,
}: {
  order: ResultOrder | null;
  /** Mail is configured, so the confirmation email really went out. */
  emailSent: boolean;
}) {
  const t = useTranslation();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-6 text-3xl font-black uppercase">
          {t("checkout.orderNotFound")}
        </h1>
        <Link
          href="/"
          className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("checkout.backToHome")}
        </Link>
      </div>
    );
  }

  async function payAgain() {
    if (!order) return;
    setPaying(true);
    setError(null);
    const res = await fetch("/api/payments/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    }).catch(() => null);
    const json = res?.ok ? ((await res.json()) as { paymentUrl?: string }) : null;
    if (json?.paymentUrl) {
      window.location.assign(json.paymentUrl);
      return;
    }
    setPaying(false);
    setError(t(errorKeyForStatus(res?.status ?? 500)));
  }

  const paid = order.status === "PAID";
  const title = paid
    ? t("checkout.paid")
    : order.awaitingOnlinePayment
      ? t("checkout.paymentPending")
      : t("checkout.orderConfirmed");
  const body = paid
    ? t("checkout.paidBody")
    : order.awaitingOnlinePayment
      ? t("checkout.paymentPendingBody")
      : t("checkout.whatNext");
  const emailNote = emailSent && !order.awaitingOnlinePayment
    ? t("checkout.emailSent", { email: order.email })
    : null;

  return (
    <div className="container-page flex-1 py-16 sm:py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-stone p-8 text-center">
        <div
          aria-hidden="true"
          className={`mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full text-2xl ${
            order.awaitingOnlinePayment ? "bg-amber-100" : "bg-accent"
          }`}
        >
          {order.awaitingOnlinePayment ? "!" : "✓"}
        </div>
        <h1 className="text-2xl font-black uppercase sm:text-3xl">{title}</h1>
        <p className="mt-4 text-sm text-ink-soft">{t("checkout.orderNumber")}</p>
        <p className="font-mono text-2xl font-bold tracking-wider">№{order.number}</p>
        <p className="mt-1">
          <Price cents={order.totalCents} currency={order.currency} />
        </p>
        <p className="mt-5 text-ink-soft">{body}</p>
        {emailNote && <p className="mt-2 text-sm text-ink-soft">{emailNote}</p>}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {order.awaitingOnlinePayment && (
            <button
              type="button"
              onClick={payAgain}
              disabled={paying}
              className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
            >
              {paying ? t("common.loading") : t("checkout.payAgain")}
            </button>
          )}
          <Link
            href="/category/all"
            className="hover-lift rounded-full border border-ink px-6 py-3 text-sm font-bold uppercase"
          >
            {t("checkout.continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
