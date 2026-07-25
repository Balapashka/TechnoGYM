import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { OverviewStats } from "@/components/admin/OverviewStats";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [products, categories, orders, users, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { totalCents: true } }),
  ]);

  return (
    <OverviewStats
      products={products}
      categories={categories}
      orders={orders}
      users={users}
      revenue={formatPrice(revenue._sum.totalCents ?? 0)}
    />
  );
}
