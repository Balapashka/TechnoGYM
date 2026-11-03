import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { orderNumber } from "@/lib/order-format";
import { syncOrderPayment } from "@/lib/payments/sync";
import { yookassaEnabled } from "@/lib/payments/yookassa";
import { CheckoutResult } from "./CheckoutResult";

export const metadata: Metadata = {
  title: "Заказ оформлен — SPORT LINER",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

/**
 * Landing page after checkout (and the ЮKassa return URL). Knowing the order
 * id — an unguessable cuid only the buyer has — is what grants access, so the
 * page shows the bare minimum: number, status, total.
 */
export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  if (orderId) {
    // Returning from ЮKassa: confirm the payment now rather than waiting for
    // the webhook, so the buyer sees the final state immediately.
    await syncOrderPayment(orderId).catch((e) =>
      console.error("[checkout/result] payment sync failed:", e),
    );
  }

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          email: true,
          totalCents: true,
          currency: true,
          paymentMethod: true,
        },
      })
    : null;

  return (
    <main className="flex flex-1 flex-col">
      <CheckoutResult
        order={
          order
            ? {
                id: order.id,
                number: orderNumber(order.id),
                status: order.status,
                email: order.email,
                totalCents: order.totalCents,
                currency: order.currency,
                awaitingOnlinePayment:
                  order.paymentMethod === "online" &&
                  order.status === "PENDING" &&
                  yookassaEnabled(),
              }
            : null
        }
      />
    </main>
  );
}
