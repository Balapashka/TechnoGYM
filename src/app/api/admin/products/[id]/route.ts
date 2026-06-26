import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { productSchema } from "@/schemas/product";
import { packList } from "@/lib/json";

function featuresToList(raw?: string): string[] {
  return (raw ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

type Ctx = { params: Promise<{ id: string }> };

/** PUT /api/admin/products/[id] — update a product (admin only). */
export async function PUT(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const json = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Keep slug unique across other products.
  const clash = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { error: "Another product already uses this slug" },
      { status: 409 },
    );
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      priceCents: Math.round(parsed.data.priceEuros * 100),
      badge: parsed.data.badge || null,
      inStock: parsed.data.inStock,
      categoryId: parsed.data.categoryId,
      features: packList(featuresToList(parsed.data.features)),
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(updated);
}

/** DELETE /api/admin/products/[id] — remove a product (admin only). */
export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  // Clear cart references first (orders keep their snapshots).
  await prisma.cartItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
