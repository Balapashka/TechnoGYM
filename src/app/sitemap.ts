import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/catalog";
import { infoSlugs } from "@/lib/pages";
import { landingSlugs } from "@/lib/landings";
import { SITE_URL } from "@/lib/site";

// Built per request: the catalog lives in the database, which does not exist
// yet when the Docker image is built.
export const dynamic = "force-dynamic";

/** Storefront sitemap: home, marketing pages, categories and products. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllProducts(),
  ]);

  const url = (path: string) => `${SITE_URL}${path}`;

  // `landings` and `infoPages` can define the same slug (e.g. /wellness); the
  // landing wins at runtime, so de-duplicate before emitting.
  const contentSlugs = [...new Set([...landingSlugs, ...infoSlugs])];

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/collections"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/category/all"), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: url(`/category/${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: url(`/product/${p.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...contentSlugs.map((slug) => ({
      url: url(`/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
