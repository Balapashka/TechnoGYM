import { prisma } from "@/lib/prisma";
import { SubscribersList } from "@/components/admin/SubscribersList";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const rows = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
  return (
    <SubscribersList
      rows={rows.map((r) => ({
        id: r.id,
        email: r.email,
        createdAtLabel: r.createdAt.toLocaleDateString("ru-RU", {
          timeZone: "Europe/Moscow",
        }),
      }))}
    />
  );
}
