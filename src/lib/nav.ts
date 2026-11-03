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
  { key: "nav.shippingShort", label: "Delivery", href: "/shipping" },
  { key: "nav.contact", label: "Contact", href: "/contact" },
  { key: "nav.forBusiness", label: "For business", href: "/business" },
];

/** Footer link columns. */
export const footerColumns: MegaColumn[] = [
  {
    key: "nav.products",
    title: "Products",
    links: [
      { key: "nav.allProducts", label: "All products", href: "/category/all" },
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
    title: "Customers",
    links: [
      { key: "nav.shipping", label: "Shipping & payment", href: "/shipping" },
      { key: "nav.returns", label: "Returns & warranty", href: "/returns" },
      { key: "nav.customerSupport", label: "Help & FAQ", href: "/customer-support" },
      { key: "nav.contact", label: "Contact", href: "/contact" },
    ],
  },
  {
    key: "nav.company",
    title: "Company",
    links: [
      { key: "nav.about", label: "About us", href: "/about" },
      { key: "nav.forBusiness", label: "For business", href: "/business" },
      { key: "nav.wellness", label: "Wellness", href: "/wellness" },
      { key: "nav.design", label: "Design", href: "/design" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { key: "nav.privacy", label: "Privacy policy", href: "/privacy" },
  { key: "nav.salesConditions", label: "Sales conditions", href: "/sales-conditions" },
  { key: "nav.terms", label: "Terms of use", href: "/terms" },
  { key: "nav.cookiePolicy", label: "Cookie policy", href: "/cookie-policy" },
];
