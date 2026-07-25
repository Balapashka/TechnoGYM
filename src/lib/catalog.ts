import { prisma } from "@/lib/prisma";
import { unpackList } from "@/lib/json";

/** Product shape used across the UI, with JSON columns already parsed. */
export type ProductDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  images: string[];
  features: string[];
  badge: string | null;
  inStock: boolean;
  /** Manufacturer, e.g. "Technogym". Empty string when unknown. */
  brand: string;
  /** Country of origin in Russian, e.g. "Италия". Empty string when unknown. */
  originCountry: string;
  categorySlug: string;
  categoryName: string;
  variants: { id: string; name: string; priceDeltaCents: number }[];
};

type ProductWithRelations = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  images: string;
  features: string;
  badge: string | null;
  inStock: boolean;
  brand: string;
  originCountry: string;
  category: { slug: string; name: string };
  variants: { id: string; name: string; priceDeltaCents: number }[];
};

function toDTO(p: ProductWithRelations): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    currency: p.currency,
    images: unpackList(p.images),
    features: unpackList(p.features),
    badge: p.badge,
    inStock: p.inStock,
    brand: p.brand,
    originCountry: p.originCountry,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    variants: p.variants,
  };
}

const include = {
  category: { select: { slug: true, name: true } },
  variants: { select: { id: true, name: true, priceDeltaCents: true } },
} as const;

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
}

export async function getAllProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    include,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toDTO);
}

export async function getProductsByCategory(
  slug: string,
): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: { category: { slug } },
    include,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toDTO);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDTO | null> {
  const row = await prisma.product.findUnique({ where: { slug }, include });
  return row ? toDTO(row) : null;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    include,
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return rows.map(toDTO);
}
