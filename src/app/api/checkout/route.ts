import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutPayloadSchema } from "@/schemas/checkout";
import { buildOrder } from "@/lib/order";
import { getCurrentUser } from "@/lib/auth";

/** POST /api/checkout — validates the payload and persists an order. */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = checkoutPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const order = buildOrder(parsed.data);
  const user = await getCurrentUser();

  const created = await prisma.order.create({
    data: {
      email: order.email,
      userId: user?.id ?? null,
      currency: order.currency,
      totalCents: order.totalCents,
      // Demo: the fake card always "succeeds", so the order is marked PAID.
      status: "PAID",
      items: {
        create: order.items.map((i) => ({
          productId: i.productId,
          nameSnapshot: i.nameSnapshot,
          priceCents: i.priceCents,
          quantity: i.quantity,
        })),
      },
    },
    select: { id: true, totalCents: true, currency: true },
  });

  return NextResponse.json({ orderId: created.id, total: created.totalCents });
}
