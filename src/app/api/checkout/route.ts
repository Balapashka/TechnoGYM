import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutPayloadSchema } from "@/schemas/checkout";
import { buildOrder, type CatalogEntry } from "@/lib/order";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { limitRequest } from "@/lib/rate-limit";
import { notifyNewOrder } from "@/lib/notify";
import { orderNumber } from "@/lib/order-format";
import { SITE_URL } from "@/lib/site";
import { createPayment, yookassaEnabled } from "@/lib/payments/yookassa";

/**
 * POST /api/checkout — validates the payload and persists an order.
 *
 * Every order starts as PENDING ("Новый"). With manual payment the manager
 * confirms it and arranges payment; with online payment the shopper is sent to
 * ЮKassa and the webhook (/api/payments/yookassa) marks the order PAID.
 */
export async function POST(request: Request) {
  const limited = limitRequest(request, "checkout", 10, 10 * 60_000);
  if (limited) return limited;

  const json = await request.json().catch(() => null);
  const parsed = checkoutPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const customer = parsed.data.customer;

  // Options the shop does not offer cannot be chosen by editing the request.
  const settings = await getSettings();
  if (customer.deliveryMethod === "pickup" && !settings.pickupAddress.trim()) {
    return NextResponse.json(
      { error: "Самовывоз недоступен" },
      { status: 400 },
    );
  }
  const paymentMethod =
    customer.paymentMethod === "online" && yookassaEnabled() ? "online" : "manual";

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
      condition: true,
      variants: { select: { id: true, name: true, priceDeltaCents: true } },
    },
  });
  const catalog = new Map<string, CatalogEntry>(
    products.map((p) => [
      p.id,
      {
        name: p.name,
        priceCents: p.priceCents,
        priceOnRequest: p.priceOnRequest,
        condition: p.condition,
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
  const pickup = customer.deliveryMethod === "pickup";

  const created = await prisma.order.create({
    data: {
      email: order.email,
      userId: user?.id ?? null,
      currency: order.currency,
      totalCents: order.totalCents,
      status: "PENDING",
      customerName: customer.fullName,
      phone: customer.phone,
      deliveryMethod: customer.deliveryMethod,
      country: customer.country,
      city: pickup ? "" : customer.city,
      address: pickup ? "" : customer.address,
      postalCode: pickup ? "" : customer.postalCode,
      comment: customer.comment || null,
      paymentMethod,
      items: {
        create: order.items.map((i) => ({
          productId: i.productId,
          nameSnapshot: i.nameSnapshot,
          variantName: i.variantName,
          priceCents: i.priceCents,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });

  let paymentUrl: string | null = null;
  if (paymentMethod === "online") {
    try {
      const payment = await createPayment({
        orderId: created.id,
        orderNumber: orderNumber(created.id),
        totalCents: created.totalCents,
        currency: created.currency,
        email: created.email,
        returnUrl: `${SITE_URL}/checkout/result?order=${created.id}`,
        lines: created.items.map((i) => ({
          name: i.variantName ? `${i.nameSnapshot} (${i.variantName})` : i.nameSnapshot,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
      });
      await prisma.order.update({
        where: { id: created.id },
        data: { paymentId: payment.id },
      });
      paymentUrl = payment.confirmation?.confirmation_url ?? null;
    } catch (e) {
      // The order is saved either way; the manager sees it and sends a link.
      console.error("[checkout] could not create a payment:", e);
    }
  }

  after(() => notifyNewOrder(created));

  return NextResponse.json({
    orderId: created.id,
    number: orderNumber(created.id),
    total: created.totalCents,
    currency: created.currency,
    paymentUrl,
  });
}
