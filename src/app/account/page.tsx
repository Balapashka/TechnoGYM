import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AccountView, type AccountOrder } from "./AccountView";

export const metadata: Metadata = { title: "Личный кабинет — SPORT LINER" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const view: AccountOrder[] = orders.map((order) => ({
    id: order.id,
    status: order.status,
    createdAtLabel: order.createdAt.toLocaleDateString("ru-RU"),
    totalCents: order.totalCents,
    currency: order.currency,
    items: order.items.map((it) => ({
      id: it.id,
      nameSnapshot: it.nameSnapshot,
      quantity: it.quantity,
      priceCents: it.priceCents,
    })),
  }));

  return (
    <AccountView
      name={user.name ?? null}
      email={user.email}
      isAdmin={user.role === "ADMIN"}
      orders={view}
    />
  );
}
