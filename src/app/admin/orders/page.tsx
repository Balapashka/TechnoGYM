import { prisma } from "@/lib/prisma";
import { isOrderStatus, orderNumber } from "@/lib/order-format";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

/** All orders, newest first, with a status filter. */
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = isOrderStatus(status) ? status : null;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        createdAt: true,
        customerName: true,
        email: true,
        phone: true,
        totalCents: true,
        currency: true,
        status: true,
        paymentMethod: true,
        deliveryMethod: true,
        city: true,
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  return (
    <OrdersTable
      filter={filter}
      counts={Object.fromEntries(counts.map((c) => [c.status, c._count._all]))}
      rows={orders.map((o) => ({
        id: o.id,
        number: orderNumber(o.id),
        createdAtLabel: o.createdAt.toLocaleString("ru-RU", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "Europe/Moscow",
        }),
        customer: o.customerName || o.email,
        phone: o.phone,
        totalCents: o.totalCents,
        currency: o.currency,
        status: o.status,
        paymentMethod: o.paymentMethod,
        deliveryMethod: o.deliveryMethod,
        city: o.city,
      }))}
    />
  );
}
