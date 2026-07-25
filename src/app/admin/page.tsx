import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [products, categories, orders, users, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { totalCents: true } }),
  ]);

  const stats = [
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Categories", value: categories, href: "/admin/categories" },
    { label: "Orders", value: orders, href: "/account" },
    { label: "Users", value: users, href: "/admin" },
    {
      label: "Revenue",
      value: formatPrice(revenue._sum.totalCents ?? 0),
      href: "/admin",
    },
  ];

  return (
    <div className="space-y-8">
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Link
              href={s.href}
              className="hover-lift block rounded-2xl border border-stone p-5"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-black">{s.value}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          + New product
        </Link>
        <Link
          href="/admin/categories"
          className="hover-lift rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
        >
          Manage categories
        </Link>
      </div>
    </div>
  );
}
