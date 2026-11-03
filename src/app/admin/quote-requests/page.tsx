import { prisma } from "@/lib/prisma";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { QuoteRequestsTable } from "@/components/admin/QuoteRequestsTable";

export const dynamic = "force-dynamic";

/** Leads: price requests on made-to-order products plus the contact / B2B forms. */
export default async function AdminQuoteRequestsPage() {
  const requests = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <AdminHeading tKey="admin.quoteRequests" />
      <QuoteRequestsTable
        rows={requests.map((r) => ({
          id: r.id,
          productId: r.productId,
          productName: r.productName,
          source: r.source,
          name: r.name,
          phone: r.phone,
          email: r.email,
          comment: r.comment,
          status: r.status,
          createdAtLabel: r.createdAt.toLocaleString("ru-RU", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Europe/Moscow",
          }),
        }))}
      />
    </div>
  );
}
