/**
 * Canonical site URL, used for `metadataBase`, robots.txt and the sitemap.
 *
 * `SITE_URL` is read at runtime, so a deployment can set it without rebuilding.
 * `NEXT_PUBLIC_BASE_URL` is the older build-time name and is kept as a
 * fallback. This module is imported by server code only.
 */
export const SITE_URL = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

/**
 * Whether search engines may index the site.
 *
 * Off by default on purpose: the catalog names real manufacturers but every
 * model code, specification and price is invented, so an indexed copy could be
 * mistaken for a genuine offer. Set `SITE_INDEXABLE=true` once the content is
 * real.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";
