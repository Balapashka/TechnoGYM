/**
 * Static navigation config for the header. Categories link to PLP pages.
 * `key` is a translation path (see src/i18n/translations.ts); `label` is the
 * English fallback used where no translation context is available.
 */

export type NavLink = { key: string; label: string; href: string };

export type MegaColumn = { key: string; title: string; links: NavLink[] };

/** Columns shown in the "Shop" mega-menu. Slugs match seeded categories. */
export const shopColumns: MegaColumn[] = [
  {
    key: "nav.cardio",
    title: "Cardio",
    links: [
      { key: "nav.treadmills", label: "Treadmills", href: "/category/treadmills" },
      { key: "nav.bikes", label: "Bikes", href: "/category/bikes" },
      { key: "nav.ellipticals", label: "Ellipticals", href: "/category/ellipticals" },
      { key: "nav.rowers", label: "Rowers", href: "/category/rowers" },
    ],
  },
  {
    key: "nav.strength",
    title: "Strength",
    links: [
      { key: "nav.strengthStations", label: "Strength stations", href: "/category/strength" },
      { key: "nav.benches", label: "Benches", href: "/category/benches" },
      { key: "nav.accessories", label: "Accessories", href: "/category/cardio-accessories" },
    ],
  },
  {
    key: "nav.explore",
    title: "Explore",
    links: [
      { key: "common.allProducts", label: "All products", href: "/category/all" },
      { key: "common.collections", label: "Collections", href: "/collections" },
      { key: "common.newArrivals", label: "New arrivals", href: "/category/all" },
    ],
  },
];

/** Top-level nav items besides "Shop" (which opens the mega-menu). */
export const primaryNav: NavLink[] = [
  { key: "nav.collections", label: "Collections", href: "/collections" },
  { key: "nav.wellness", label: "Wellness", href: "/wellness" },
  { key: "nav.design", label: "Design", href: "/design" },
  { key: "nav.stories", label: "Stories", href: "/stories" },
  { key: "nav.community", label: "Community", href: "/community" },
];

/** Footer link columns. */
export const footerColumns: MegaColumn[] = [
  {
    key: "nav.products",
    title: "Products",
    links: [
      { key: "nav.treadmills", label: "Treadmills", href: "/category/treadmills" },
      { key: "nav.bikes", label: "Bikes", href: "/category/bikes" },
      { key: "nav.ellipticals", label: "Ellipticals", href: "/category/ellipticals" },
      { key: "nav.rowers", label: "Rowers", href: "/category/rowers" },
      { key: "nav.strength", label: "Strength", href: "/category/strength" },
      { key: "nav.accessories", label: "Accessories", href: "/category/cardio-accessories" },
    ],
  },
  {
    key: "nav.support",
    title: "Support",
    links: [
      { key: "nav.contact", label: "Contact", href: "/contact" },
      { key: "nav.customerSupport", label: "Customer support", href: "/customer-support" },
      { key: "nav.shipping", label: "Shipping", href: "/shipping" },
      { key: "nav.returns", label: "Returns", href: "/returns" },
    ],
  },
  {
    key: "nav.company",
    title: "Company",
    links: [
      { key: "nav.about", label: "About", href: "/about" },
      { key: "nav.sustainability", label: "Sustainability", href: "/sustainability" },
      { key: "nav.careers", label: "Careers", href: "/careers" },
      { key: "nav.press", label: "Press", href: "/press" },
    ],
  },
];

export const socialLinks: NavLink[] = [
  { key: "social.instagram", label: "Instagram", href: "/social" },
  { key: "social.tiktok", label: "TikTok", href: "/social" },
  { key: "social.x", label: "X", href: "/social" },
  { key: "social.facebook", label: "Facebook", href: "/social" },
  { key: "social.linkedin", label: "LinkedIn", href: "/social" },
  { key: "social.youtube", label: "YouTube", href: "/social" },
];

export const legalLinks: NavLink[] = [
  { key: "nav.privacy", label: "Privacy policy", href: "/privacy" },
  { key: "nav.cookiePolicy", label: "Cookie policy", href: "/cookie-policy" },
  { key: "nav.terms", label: "Terms & conditions", href: "/terms" },
  { key: "nav.salesConditions", label: "Sales conditions", href: "/sales-conditions" },
];
