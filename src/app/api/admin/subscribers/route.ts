import { prisma } from "@/lib/prisma";
import { forbidUnlessAdmin } from "@/lib/auth";

/** GET /api/admin/subscribers — newsletter list as CSV (admin only). */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;

  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  const csv = [
    "email,created_at",
    ...rows.map((r) => `${r.email},${r.createdAt.toISOString()}`),
  ].join("\n");
  // BOM so Excel opens the file as UTF-8.
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
