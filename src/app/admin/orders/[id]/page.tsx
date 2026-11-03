import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { orderNumber } from "@/lib/order-format";
import { OrderDetail } from "@/components/admin/OrderDetail";

export const dynamic = "force-dynamic";

const COUNTRY_NAMES: Record<string, string> = {
  RU: "Россия",
  KZ: "Казахстан",
  UZ: "Узбекистан",
  KG: "Кыргызстан",
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!order) notFound();

  return (
    <OrderDetail
      order={{
        id: order.id,
        number: orderNumber(order.id),
        createdAtLabel: order.createdAt.toLocaleString("ru-RU", {
          dateStyle: "long",
          timeStyle: "short",
          timeZone: "Europe/Moscow",
        }),
        status: order.status,
        email: order.email,
        customerName: order.customerName,
        phone: order.phone,
        deliveryMethod: order.deliveryMethod,
        addressLine: [
          order.postalCode,
          COUNTRY_NAMES[order.country] ?? order.country,
          order.city,
          order.address,
        ]
          .filter(Boolean)
          .join(", "),
        comment: order.comment,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        adminNote: order.adminNote ?? "",
        totalCents: order.totalCents,
        currency: order.currency,
        registered: Boolean(order.userId),
        items: order.items.map((i) => ({
          id: i.id,
          name: i.nameSnapshot,
          variantName: i.variantName,
          quantity: i.quantity,
          priceCents: i.priceCents,
          slug: i.product?.slug ?? null,
        })),
      }}
    />
  );
}
