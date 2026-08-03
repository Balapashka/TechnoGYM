import { prisma } from "@/lib/prisma";
import { unpackList } from "@/lib/json";
import { originRank } from "@/lib/countries";

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
  /**
   * Hide the price in the storefront and offer a quote request instead.
   * `priceCents` is still populated — never render it when this is true.
   */
  priceOnRequest: boolean;
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
  priceOnRequest: boolean;
  category: { slug: string; name: string };
  variants: { id: string; name: string; priceDeltaCents: number }[];
};

function toDTO(p: ProductWithRelations): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    // Quote-only products must not carry their price into the browser: the DTO
    // is serialised into the RSC payload of every catalog page, persisted by
    // the compare store and returned verbatim by GET /api/products. Rendering
    // is already guarded, this closes the data channel behind it. Order
    // building and the admin read Prisma directly, so both still see the real
    // figure.
    priceCents: p.priceOnRequest ? 0 : p.priceCents,
    currency: p.currency,
    images: unpackList(p.images),
    features: unpackList(p.features),
    badge: p.badge,
    inStock: p.inStock,
    brand: p.brand,
    originCountry: p.originCountry,
    priceOnRequest: p.priceOnRequest,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    variants: p.variants,
  };
}

const include = {
  category: { select: { slug: true, name: true } },
  variants: { select: { id: true, name: true, priceDeltaCents: true } },
} as const;

/**
 * Lead with the priority sourcing country (Italy) while keeping the seeded
 * order inside each group. SQLite cannot order by a custom list, so the sort
 * happens here — the catalog is small enough that this is cheaper than a
 * denormalised rank column.
 */
function byOriginPriority(products: ProductDTO[]): ProductDTO[] {
  return [...products].sort(
    (a, b) => originRank(a.originCountry) - originRank(b.originCountry),
  );
}

export type CategoryDTO = {
  id: string;
  slug: string;
  name: string;
  /** Representative photo: first image of the category's oldest product. */
  image: string | null;
};

export async function getCategories(): Promise<CategoryDTO[]> {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      products: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { images: true },
      },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    image: unpackList(c.products[0]?.images)[0] ?? null,
  }));
}

export async function getAllProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    include,
    orderBy: { createdAt: "asc" },
  });
  return byOriginPriority(rows.map(toDTO));
}

export async function getProductsByCategory(
  slug: string,
): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: { category: { slug } },
    include,
    orderBy: { createdAt: "asc" },
  });
  return byOriginPriority(rows.map(toDTO));
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDTO | null> {
  const row = await prisma.product.findUnique({ where: { slug }, include });
  return row ? toDTO(row) : null;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductDTO[]> {
  // Ranked before slicing: taking `limit` rows first would fill the homepage
  // carousels with whichever origin happens to be seeded earliest.
  const rows = await prisma.product.findMany({
    include,
    orderBy: { createdAt: "asc" },
  });
  return byOriginPriority(rows.map(toDTO)).slice(0, limit);
}
