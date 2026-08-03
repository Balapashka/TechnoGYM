import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutPayloadSchema } from "@/schemas/checkout";
import { buildOrder, type CatalogEntry } from "@/lib/order";
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

  // Re-read every line from the catalog: the request may claim any price, so
  // names and prices must come from the database instead.
  const ids = [...new Set(parsed.data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      priceCents: true,
      priceOnRequest: true,
      variants: { select: { id: true, priceDeltaCents: true } },
    },
  });

  const catalog = new Map<string, CatalogEntry>(
    products.map((p) => [
      p.id,
      {
        name: p.name,
        priceCents: p.priceCents,
        priceOnRequest: p.priceOnRequest,
        variants: p.variants,
      },
    ]),
  );

  const built = buildOrder(parsed.data, catalog);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 409 });
  }
  const order = built.order;

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

  return NextResponse.json({
    orderId: created.id,
    total: created.totalCents,
    currency: created.currency,
  });
}
