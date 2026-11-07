import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forbidUnlessAdmin } from "@/lib/auth";
import { packList } from "@/lib/json";
import { resolveMediaSrc } from "@/lib/media";
import { decodeCsvBytes, parseCatalogCsv, parseCsv } from "@/lib/csv";
import { isImageUrl } from "@/schemas/product";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * POST /api/admin/catalog/import — create/update products from a CSV file
 * (admin only). multipart/form-data: `file`, optional `deleteMissing=1` and
 * `dryRun=1`. All-or-nothing: any invalid line rejects the whole file, so a
 * half-applied catalog is impossible.
 */
export async function POST(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ errors: ["Прикрепите CSV-файл"] }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ errors: ["Файл больше 10 МБ"] }, { status: 413 });
  }
  const deleteMissing = form?.get("deleteMissing") === "1";
  const dryRun = form?.get("dryRun") === "1";

  const text = decodeCsvBytes(new Uint8Array(await file.arrayBuffer()));
  const { rows, errors } = parseCatalogCsv(parseCsv(text));

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryId = new Map(categories.map((c) => [c.slug, c.id]));
  rows.forEach((r) => {
    if (!categoryId.has(r.categorySlug)) {
      errors.push(`${r.slug}: неизвестная категория «${r.categorySlug}»`);
    }
    const badImage = r.images.find((u) => !isImageUrl(u));
    if (badImage) errors.push(`${r.slug}: неверная ссылка на фото «${badImage}»`);
  });
  if (errors.length > 0) {
    return NextResponse.json({ errors: errors.slice(0, 100) }, { status: 400 });
  }

  const existing = await prisma.product.findMany({ select: { id: true, slug: true } });
  const existingSlugs = new Set(existing.map((p) => p.slug));
  const fileSlugs = new Set(rows.map((r) => r.slug));
  const toDelete = deleteMissing ? existing.filter((p) => !fileSlugs.has(p.slug)) : [];
  const summary = {
    created: rows.filter((r) => !existingSlugs.has(r.slug)).length,
    updated: rows.filter((r) => existingSlugs.has(r.slug)).length,
    deleted: toDelete.length,
    dryRun,
  };
  if (dryRun) return NextResponse.json(summary);

  const placeholder = resolveMediaSrc("productCard");
  await prisma.$transaction(
    async (tx) => {
      for (const r of rows) {
        const data = {
          name: r.name,
          description: r.description,
          priceCents: r.priceCents,
          brand: r.brand,
          originCountry: r.originCountry,
          priceOnRequest: r.priceOnRequest,
          inStock: r.inStock,
          badge: r.badge,
          // No «condition» column in the file: keep what each product has.
          ...(r.condition ? { condition: r.condition } : {}),
          categoryId: categoryId.get(r.categorySlug)!,
        };
        // Empty photo / feature cells keep what the product already has, so
        // a price-only sheet cannot wipe the gallery.
        await tx.product.upsert({
          where: { slug: r.slug },
          update: {
            ...data,
            ...(r.images.length ? { images: packList(r.images) } : {}),
            ...(r.features.length ? { features: packList(r.features) } : {}),
          },
          create: {
            ...data,
            slug: r.slug,
            images: packList(r.images.length ? r.images : [placeholder]),
            features: packList(r.features),
            variants: { create: [{ name: "Стандартная комплектация", priceDeltaCents: 0 }] },
          },
        });
      }
      if (toDelete.length) {
        const ids = toDelete.map((p) => p.id);
        await tx.cartItem.deleteMany({ where: { productId: { in: ids } } });
        await tx.product.deleteMany({ where: { id: { in: ids } } });
      }
    },
    { timeout: 120_000 },
  );

  return NextResponse.json(summary);
}
