/** Store brand name, used by the logo, page titles and legal copy. */
export const BRAND_NAME = "SPORT LINER";

/** Suffix appended to page titles, e.g. "Cart — SPORT LINER". */
export const titleWithBrand = (title: string) => `${title} — ${BRAND_NAME}`;
