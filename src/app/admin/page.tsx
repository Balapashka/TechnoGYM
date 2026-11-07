import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { missingLaunchSettings } from "@/lib/settings-shape";
import { mailEnabled } from "@/lib/mailer";
import { telegramEnabled } from "@/lib/notify";
import { yookassaEnabled } from "@/lib/payments/yookassa";
import { isIndexable } from "@/lib/site";
import { OverviewStats } from "@/components/admin/OverviewStats";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [products, newOrders, orders, newLeads, users, revenue, settings, telegram] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count(),
      prisma.quoteRequest.count({ where: { status: "NEW" } }),
      prisma.user.count({ where: { role: "USER" } }),
      // Money actually received: cancelled and unconfirmed orders excluded.
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { totalCents: true },
      }),
      getSettings(),
      telegramEnabled(),
    ]);
  const indexing = await isIndexable();

  return (
    <OverviewStats
      products={products}
      newOrders={newOrders}
      orders={orders}
      newLeads={newLeads}
      users={users}
      revenue={formatPrice(revenue._sum.totalCents ?? 0)}
      missingSettings={missingLaunchSettings(settings)}
      integrations={{
        telegram,
        email: mailEnabled(),
        payments: yookassaEnabled(),
        indexing,
      }}
      testMode={
        process.env.DEMO_ACCOUNTS === "true" ||
        process.env.DEMO_EXPOSE_RESET_TOKEN === "true"
      }
    />
  );
}
