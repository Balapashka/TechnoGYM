import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { forbidUnlessAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/order-format";
import { notifyOrderStatus } from "@/lib/notify";

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  adminNote: z.string().max(2000).optional(),
  notifyCustomer: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/orders/[id] — change status / manager note (admin only). */
export async function PATCH(request: Request, { params }: Ctx) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, email: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.order.update({
    where: { id },
    data: {
      status: parsed.data.status,
      adminNote: parsed.data.adminNote?.trim() || null,
    },
  });

  if (parsed.data.notifyCustomer && order.status !== parsed.data.status) {
    const status = parsed.data.status;
    after(() => notifyOrderStatus(id, order.email, status));
  }
  return NextResponse.json({ ok: true });
}
