import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { productSchema, splitLines } from "@/schemas/product";
import { packList } from "@/lib/json";
import { resolveMediaSrc } from "@/lib/media";
import { BASE_CURRENCY } from "@/lib/format";


/** POST /api/admin/products — create a product (admin only). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const exists = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (exists) {
    return NextResponse.json(
      { error: "A product with this slug already exists" },
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

  const created = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      priceCents: Math.round(parsed.data.priceRub * 100),
      currency: BASE_CURRENCY,
      brand: parsed.data.brand,
      originCountry: parsed.data.originCountry,
      images: packList(
        splitLines(parsed.data.images).length > 0
          ? splitLines(parsed.data.images)
          : [resolveMediaSrc("productCard")],
      ),
      features: packList(splitLines(parsed.data.features)),
      badge: parsed.data.badge || null,
      inStock: parsed.data.inStock,
      priceOnRequest: parsed.data.priceOnRequest,
      condition: parsed.data.condition,
      categoryId: parsed.data.categoryId,
      variants: { create: [{ name: "Стандартная комплектация", priceDeltaCents: 0 }] },
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(created, { status: 201 });
}
