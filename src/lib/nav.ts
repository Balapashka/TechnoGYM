/** Static navigation config for the header. Categories link to PLP pages. */

export type NavLink = { label: string; href: string };

export type MegaColumn = { title: string; links: NavLink[] };

/** Columns shown in the "Shop" mega-menu. Slugs match seeded categories. */
export const shopColumns: MegaColumn[] = [
  {
    title: "Cardio",
    links: [
      { label: "Treadmills", href: "/category/treadmills" },
      { label: "Bikes", href: "/category/bikes" },
      { label: "Ellipticals", href: "/category/ellipticals" },
      { label: "Rowers", href: "/category/rowers" },
    ],
  },
  {
    title: "Strength",
    links: [
      { label: "Strength stations", href: "/category/strength" },
      { label: "Benches", href: "/category/strength" },
      { label: "Accessories", href: "/category/accessories" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "All products", href: "/category/all" },
      { label: "Collections", href: "/collections" },
      { label: "New arrivals", href: "/category/all" },
    ],
  },
];

/** Top-level nav items besides "Shop" (which opens the mega-menu). */
export const primaryNav: NavLink[] = [
  { label: "Collections", href: "/collections" },
  { label: "Wellness", href: "/wellness" },
  { label: "Design", href: "/design" },
  { label: "Stories", href: "/stories" },
  { label: "Community", href: "/community" },
];

/** Footer link columns. */
export const footerColumns: MegaColumn[] = [
  {
    title: "Products",
    links: [
      { label: "Treadmills", href: "/category/treadmills" },
      { label: "Bikes", href: "/category/bikes" },
      { label: "Ellipticals", href: "/category/ellipticals" },
      { label: "Rowers", href: "/category/rowers" },
      { label: "Strength", href: "/category/strength" },
      { label: "Accessories", href: "/category/accessories" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Customer support", href: "/customer-support" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
];

export const socialLinks: NavLink[] = [
  { label: "Instagram", href: "/social" },
  { label: "TikTok", href: "/social" },
  { label: "X", href: "/social" },
  { label: "Facebook", href: "/social" },
  { label: "LinkedIn", href: "/social" },
  { label: "YouTube", href: "/social" },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Cookie policy", href: "/cookie-policy" },
  { label: "Terms & conditions", href: "/terms" },
  { label: "Sales conditions", href: "/sales-conditions" },
];
