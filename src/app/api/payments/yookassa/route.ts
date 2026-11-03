import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, yookassaEnabled } from "@/lib/payments/yookassa";
import { syncOrderPayment } from "@/lib/payments/sync";

/**
 * POST /api/payments/yookassa — HTTP notifications from ЮKassa.
 *
 * Set this URL (https://<domain>/api/payments/yookassa) in the ЮKassa
 * dashboard → Интеграция → HTTP-уведомления, events payment.succeeded and
 * payment.canceled. The body is not trusted: the payment is re-read from the
 * ЮKassa API by id, and only that answer changes the order.
 */
export async function POST(request: Request) {
  if (!yookassaEnabled()) {
    return NextResponse.json({ error: "Payments are not configured" }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as {
    object?: { id?: string };
  } | null;
  const paymentId = body?.object?.id;
  if (!paymentId || typeof paymentId !== "string") {
    return NextResponse.json({ error: "Bad notification" }, { status: 400 });
  }

  const payment = await getPayment(paymentId);
  const orderId = payment?.metadata?.orderId;
  if (!payment || !orderId) {
    // Unknown to ЮKassa — a forged or foreign notification. Acknowledge so it
    // is not retried, change nothing.
    return NextResponse.json({ ok: true });
  }

  // The payment must belong to this order (it is the one we created for it).
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentId: true },
  });
  if (order?.paymentId === payment.id) {
    await syncOrderPayment(orderId);
  }
  return NextResponse.json({ ok: true });
}
