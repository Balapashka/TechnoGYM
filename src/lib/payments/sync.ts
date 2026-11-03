import "server-only";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, yookassaEnabled } from "@/lib/payments/yookassa";
import { notifyOrderPaid } from "@/lib/notify";

/**
 * Pull the payment status for an order from ЮKassa and mark the order PAID
 * when the payment succeeded. Used by the webhook and by the return page (so
 * the shopper sees "paid" even if the webhook is a few seconds late).
 * Idempotent: only a PENDING order is moved, and only once.
 */
export async function syncOrderPayment(orderId: string): Promise<void> {
  if (!yookassaEnabled()) return;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, paymentId: true, totalCents: true },
  });
  if (!order?.paymentId || order.status !== "PENDING") return;

  const payment = await getPayment(order.paymentId);
  if (!payment || payment.status !== "succeeded" || !payment.paid) return;
  // The amount must match what the order costs — never trust a partial payment.
  if (Math.round(Number(payment.amount.value) * 100) !== order.totalCents) {
    console.error("[payments] amount mismatch for order", orderId);
    return;
  }

  const updated = await prisma.order.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PAID" },
  });
  if (updated.count > 0) after(() => notifyOrderPaid(order.id));
}
