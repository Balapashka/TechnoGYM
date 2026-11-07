/**
 * Shop navigation built from the live catalog (pure — shared by the mega
 * menu, the mobile menu and the footer). Only categories that have products
 * are passed in, so a link never leads to an empty page, and a category the
 * owner creates in the admin shows up without a code change.
 */
import { brandSlug } from "@/lib/catalog-url";

/** Brands that have a landing page in src/lib/brand-pages.ts. */
const BRAND_PAGE_SLUGS = ["technogym", "unix-fit"];

export type NavCategory = { slug: string; name: string; count: number };
export type NavBrand = { name: string; count: number };
export type ShopNav = {
  categories: NavCategory[];
  brands: NavBrand[];
  /** Used (б/у) products in the catalog; the «Б/у» link appears only when > 0. */
  used?: number;
};

/** Listing of used (б/у) equipment: the whole catalog filtered by condition. */
export const USED_HREF = "/category/all?cond=used";

export const CARDIO_SLUGS = ["treadmills", "bikes", "ellipticals", "rowers"];
export const STRENGTH_SLUGS = ["strength", "benches", "racks", "free-weights"];

export type NavLinkItem = {
  href: string;
  /** Translation key, or null when `label` is literal text. */
  key: string | null;
  label: string;
  /** Category slug, so the caller can localize the name. */
  slug?: string;
};
export type NavColumn = { key: string; links: NavLinkItem[] };

function categoryLinks(cats: NavCategory[]): NavLinkItem[] {
  return cats.map((c) => ({
    href: `/category/${c.slug}`,
    key: null,
    label: c.name,
    slug: c.slug,
  }));
}

/** Columns of the "Магазин" mega menu. Empty columns are dropped. */
export function shopColumnsFrom(nav: ShopNav): NavColumn[] {
  const cardio = nav.categories.filter((c) => CARDIO_SLUGS.includes(c.slug));
  const strength = nav.categories.filter((c) => STRENGTH_SLUGS.includes(c.slug));
  const other = nav.categories.filter(
    (c) => !CARDIO_SLUGS.includes(c.slug) && !STRENGTH_SLUGS.includes(c.slug),
  );
  const columns: NavColumn[] = [
    { key: "nav.cardio", links: categoryLinks(cardio) },
    { key: "nav.strength", links: categoryLinks([...strength, ...other]) },
    {
      key: "nav.brands",
      links: nav.brands.map((b) => ({
        href: BRAND_PAGE_SLUGS.includes(brandSlug(b.name))
          ? `/brand/${brandSlug(b.name)}`
          : `/category/all?brand=${brandSlug(b.name)}`,
        key: null,
        label: b.name,
      })),
    },
    {
      key: "nav.explore",
      links: [
        { href: "/category/all", key: "common.allProducts", label: "All products" },
        { href: "/category/all?stock=1", key: "nav.inStockMoscow", label: "In stock" },
        ...(nav.used
          ? [{ href: USED_HREF, key: "nav.used", label: "Used equipment" }]
          : []),
        { href: "/business", key: "nav.forBusiness", label: "For business" },
      ],
    },
  ];
  return columns.filter((c) => c.links.length > 0);
}
