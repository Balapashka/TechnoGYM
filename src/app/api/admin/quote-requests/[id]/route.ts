import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { forbidUnlessAdmin } from "@/lib/auth";
import { LEAD_STATUSES } from "@/lib/order-format";

const patchSchema = z.object({ status: z.enum(LEAD_STATUSES) });
type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/quote-requests/[id] — move a lead along (admin only). */
export async function PATCH(request: Request, { params }: Ctx) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const res = await prisma.quoteRequest.updateMany({
    where: { id },
    data: { status: parsed.data.status },
  });
  if (res.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/quote-requests/[id] — remove spam (admin only). */
export async function DELETE(_request: Request, { params }: Ctx) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  await prisma.quoteRequest.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
