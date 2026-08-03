import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

// Read per request, not baked into the build: the deployment sets
// SITE_INDEXABLE as a runtime environment variable (see docker-compose.yml).
export const dynamic = "force-dynamic";

/**
 * robots.txt. The demo blocks all crawlers (see SITE_INDEXABLE); once the
 * catalog holds real data, set `SITE_INDEXABLE=true` to expose the storefront
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
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
