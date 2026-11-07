/**
 * Static navigation config for the header. Categories link to PLP pages.
 * `key` is a translation path (see src/i18n/translations.ts); `label` is the
 * English fallback used where no translation context is available.
 */

export type NavLink = { key: string; label: string; href: string };

export type MegaColumn = { key: string; title: string; links: NavLink[] };

/** Top-level nav items besides "Shop" (which opens the mega-menu). */
export const primaryNav: NavLink[] = [
  { key: "nav.collections", label: "Collections", href: "/collections" },
  { key: "nav.shippingShort", label: "Delivery", href: "/shipping" },
  { key: "nav.contact", label: "Contact", href: "/contact" },
  { key: "nav.forBusiness", label: "For business", href: "/business" },
];

/** Footer link columns (the product column is built from the catalog). */
export const footerColumns: MegaColumn[] = [
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
