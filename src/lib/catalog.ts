import { cache } from "react";
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
  /** Representative photo: first real (non-placeholder) product image. */
  image: string | null;
  /** Number of products in the category. */
  count: number;
};

/**
 * Display order of the standard categories (cardio first, then strength);
 * categories the owner adds later follow, alphabetically.
 */
export const CATEGORY_ORDER = [
  "treadmills",
  "bikes",
  "ellipticals",
  "rowers",
  "strength",
  "benches",
  "racks",
  "free-weights",
  "cardio-accessories",
  "recovery",
];

export function sortCategories<T extends { slug: string; name: string }>(list: T[]): T[] {
  const rank = (slug: string) => {
    const i = CATEGORY_ORDER.indexOf(slug);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...list].sort(
    (a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name, "ru"),
  );
}

/**
 * All categories with their product counts. Pass `nonEmpty` for storefront
 * navigation, so a category without products never leads to an empty page.
 */
export async function getCategories(
  opts: { nonEmpty?: boolean } = {},
): Promise<CategoryDTO[]> {
  const rows = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { products: true } },
      products: {
        orderBy: { createdAt: "asc" },
        take: 6,
        select: { images: true },
      },
    },
  });
  const list = rows.map((c) => {
    const images = c.products.flatMap((p) => unpackList(p.images).slice(0, 1));
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: images.find((src) => !src.startsWith("/placeholders/")) ?? images[0] ?? null,
      count: c._count.products,
    };
  });
  return sortCategories(opts.nonEmpty ? list.filter((c) => c.count > 0) : list);
}

export type BrandDTO = { name: string; count: number; inStock: number };

/** Brands present in the catalog, largest first. */
export async function getBrands(): Promise<BrandDTO[]> {
  const rows = await prisma.product.groupBy({
    by: ["brand", "inStock"],
    _count: { _all: true },
  });
  const map = new Map<string, BrandDTO>();
  for (const r of rows) {
    if (!r.brand) continue;
    const b = map.get(r.brand) ?? { name: r.brand, count: 0, inStock: 0 };
    b.count += r._count._all;
    if (r.inStock) b.inStock += r._count._all;
    map.set(r.brand, b);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
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

/**
 * Shop navigation data (non-empty categories + brands), memoized per request
 * so the header, mobile menu and footer share one query.
 */
export const getShopNav = cache(async () => {
  try {
    const [categories, brands] = await Promise.all([
      getCategories({ nonEmpty: true }),
      getBrands(),
    ]);
    return {
      categories: categories.map(({ slug, name, count }) => ({ slug, name, count })),
      brands: brands.map(({ name, count }) => ({ name, count })),
    };
  } catch (e) {
    console.error("[nav] could not load categories:", e);
    return { categories: [], brands: [] };
  }
});

/** Pick up to `limit` products, round-robin across categories for variety. */
export function diverse<T extends { categorySlug: string }>(list: T[], limit: number): T[] {
  const byCat = new Map<string, T[]>();
  for (const p of list) {
    const arr = byCat.get(p.categorySlug) ?? [];
    arr.push(p);
    byCat.set(p.categorySlug, arr);
  }
  const queues = [...byCat.values()];
  const out: T[] = [];
  while (out.length < limit && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
      if (out.length >= limit) break;
    }
  }
  return out;
}

const hasPhoto = (p: ProductDTO) =>
  p.images.length > 0 && !p.images[0].startsWith("/placeholders/");

export type BrandShowcase = {
  name: string;
  count: number;
  inStock: number;
  originCountry: string;
  image: string | null;
};

/** Everything the homepage shows, from one catalog read. */
export async function getHomeShowcase() {
  const all = await getAllProducts();
  const flagships = diverse(all.filter((p) => p.priceOnRequest && hasPhoto(p)), 8);
  const inStock = diverse(
    all.filter((p) => p.inStock && !p.priceOnRequest && hasPhoto(p)),
    12,
  );
  const brands = new Map<string, BrandShowcase>();
  for (const p of all) {
    if (!p.brand) continue;
    const b = brands.get(p.brand) ?? {
      name: p.brand,
      count: 0,
      inStock: 0,
      originCountry: p.originCountry,
      image: null,
    };
    b.count += 1;
    if (p.inStock) b.inStock += 1;
    if (!b.image && hasPhoto(p)) b.image = p.images[0];
    brands.set(p.brand, b);
  }
  return {
    flagships: flagships.length ? flagships : all.slice(0, 8),
    inStock,
    brands: [...brands.values()].sort((a, b) => b.count - a.count),
  };
}
