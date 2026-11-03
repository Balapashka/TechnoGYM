import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

// Read per request, not baked into the build: the deployment sets
// SITE_INDEXABLE as a runtime environment variable (see docker-compose.yml).
export const dynamic = "force-dynamic";

/**
 * robots.txt. Blocks all crawlers until `SITE_INDEXABLE=true` (set it once the
 * catalog, prices and legal details are final); then exposes the storefront
 * while keeping private and transactional routes out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) {
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
