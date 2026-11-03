import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { limitRequest } from "@/lib/rate-limit";
import { orderNumber } from "@/lib/order-format";
import { SITE_URL } from "@/lib/site";
import { createPayment, yookassaEnabled } from "@/lib/payments/yookassa";

const bodySchema = z.object({ orderId: z.string().min(1).max(100) });

/**
 * POST /api/payments/retry — start a new online payment for an unpaid order
 * (the shopper closed the payment page or the card was declined). Knowing the
 * order id is enough: it is an unguessable cuid shown only to the buyer.
 */
export async function POST(request: Request) {
  const limited = limitRequest(request, "pay-retry", 10, 10 * 60_000);
  if (limited) return limited;
  if (!yookassaEnabled()) {
    return NextResponse.json({ error: "Payments are not configured" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true },
  });
  if (!order || order.status !== "PENDING") {
    return NextResponse.json({ error: "Order cannot be paid" }, { status: 409 });
  }

  try {
    const payment = await createPayment({
      orderId: order.id,
      orderNumber: orderNumber(order.id),
      totalCents: order.totalCents,
      currency: order.currency,
      email: order.email,
      returnUrl: `${SITE_URL}/checkout/result?order=${order.id}`,
      lines: order.items.map((i) => ({
        name: i.variantName ? `${i.nameSnapshot} (${i.variantName})` : i.nameSnapshot,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
      attempt: String(Date.now()),
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: payment.id, paymentMethod: "online" },
    });
    return NextResponse.json({
      paymentUrl: payment.confirmation?.confirmation_url ?? null,
    });
  } catch (e) {
    console.error("[payments] retry failed:", e);
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
  }
}
