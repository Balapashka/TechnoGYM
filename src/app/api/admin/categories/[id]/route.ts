import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categorySchema } from "@/schemas/product";

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/admin/categories/[id] — rename / reslug a category (admin only). */
export async function PUT(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const json = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid category data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const clash = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { error: "Another category already uses this slug" },
      { status: 409 },
    );
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, slug: parsed.data.slug },
    select: { id: true, slug: true },
  });

  return NextResponse.json(updated);
}

/** DELETE /api/admin/categories/[id] — only when it has no products. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Move or delete its ${count} product(s) first` },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
