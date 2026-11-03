import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { productSchema, splitLines } from "@/schemas/product";
import { packList } from "@/lib/json";
import { resolveMediaSrc } from "@/lib/media";


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

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      priceCents: Math.round(parsed.data.priceRub * 100),
      brand: parsed.data.brand,
      originCountry: parsed.data.originCountry,
      badge: parsed.data.badge || null,
      inStock: parsed.data.inStock,
      priceOnRequest: parsed.data.priceOnRequest,
      categoryId: parsed.data.categoryId,
      features: packList(splitLines(parsed.data.features)),
      // Only touch photos when the form sent the field.
      ...(parsed.data.images !== undefined
        ? {
            images: packList(
              splitLines(parsed.data.images).length > 0
                ? splitLines(parsed.data.images)
                : [resolveMediaSrc("productCard")],
            ),
          }
        : {}),
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

  // Clear cart references first. Orders keep their name/price snapshots and
  // their product link is set to null by the database (onDelete: SetNull).
  await prisma.cartItem.deleteMany({ where: { productId: id } });
  const res = await prisma.product.deleteMany({ where: { id } });
  if (res.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
