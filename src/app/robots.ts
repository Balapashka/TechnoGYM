import type { MetadataRoute } from "next";
import { isIndexable, SITE_URL } from "@/lib/site";

// Read per request, not baked into the build: indexing is an owner setting
// (/admin/settings) or the SITE_INDEXABLE env switch.
export const dynamic = "force-dynamic";

/**
 * robots.txt. Blocks all crawlers until indexing is turned on (admin settings
 * or `SITE_INDEXABLE=true`); then exposes the storefront
 * while keeping private and transactional routes out of the index.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!(await isIndexable())) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/account",
        "/cart",
        "/checkout",
        "/compare",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/search",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
