import { prisma } from "@/lib/prisma";
import { forbidUnlessAdmin } from "@/lib/auth";
import { unpackList } from "@/lib/json";
import { CATALOG_COLUMNS, catalogRowToCells, toCsv } from "@/lib/csv";

/** GET /api/admin/catalog/export — the whole catalog as an Excel-ready CSV. */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { category: { select: { slug: true } } },
  });
  const csv = toCsv([
    [...CATALOG_COLUMNS],
    ...products.map((p) =>
      catalogRowToCells({
        slug: p.slug,
        name: p.name,
        categorySlug: p.category.slug,
        brand: p.brand,
        originCountry: p.originCountry,
        priceCents: p.priceCents,
        priceOnRequest: p.priceOnRequest,
        inStock: p.inStock,
        condition: p.condition === "used" ? "used" : "new",
        badge: p.badge,
        description: p.description,
        features: unpackList(p.features),
        images: unpackList(p.images),
      }),
    ),
  ]);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="catalog-${date}.csv"`,
    },
  });
}
