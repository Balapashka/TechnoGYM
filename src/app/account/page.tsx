import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "My account — SPORT LINER" };
export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page flex-1 py-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              My account
            </p>
            <h1 className="text-4xl font-black uppercase">
              Hi, {user.name ?? "there"}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
          </div>
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hover-lift rounded-full bg-ink px-5 py-2.5 text-xs font-bold uppercase text-paper"
            >
              Admin dashboard
            </Link>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="mb-4 mt-10 text-lg font-black uppercase">Order history</h2>
      </Reveal>

      {orders.length === 0 ? (
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-dashed border-stone p-10 text-center">
            <p className="text-ink-soft">No orders yet.</p>
            <Link
              href="/category/all"
              className="hover-lift mt-4 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
            >
              Start shopping
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <Reveal key={order.id} delay={Math.min(i * 0.05, 0.3)}>
              <div className="rounded-2xl border border-stone p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone pb-3">
                  <div>
                    <span className="font-mono text-sm">{order.id}</span>
                    <span className="ml-3 text-xs text-ink-soft">
                      {order.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        statusStyle[order.status] ?? "bg-mist text-ink"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold">
                      {formatPrice(order.totalCents, order.currency)}
                    </span>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                  {order.items.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>
                        {it.nameSnapshot} × {it.quantity}
                      </span>
                      <span>{formatPrice(it.priceCents * it.quantity, order.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
