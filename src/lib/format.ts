/**
 * Price formatting for the CIS storefront.
 *
 * Catalog prices are stored in minor units (kopeks) of BASE_CURRENCY. The
 * shopper's selected country only changes how a price is *displayed*: orders
 * are always created in the product's own currency.
 */

/** Currency every catalog price is stored in. */
export const BASE_CURRENCY = "RUB";

/** Formatting locale used when none is supplied (matches the default country). */
export const BASE_LOCALE = "ru-RU";

/**
 * Display-only conversion rates, expressed as "1 RUB = N units". Rounded
 * reference values, not a live FX feed: every converted price is shown with
 * "≈" and orders are always charged in roubles. Update them here when the
 * exchange rate moves noticeably.
 */
const DISPLAY_RATES: Record<string, number> = {
  RUB: 1,
  KZT: 6.4,
  UZS: 155,
  KGS: 1.1,
};

/** Whether a price in `currency` can be shown in `target`. */
export function canConvert(currency: string, target: string): boolean {
  return currency in DISPLAY_RATES && target in DISPLAY_RATES;
}

/**
 * Convert minor units between two supported currencies. Returns the input
 * unchanged when either side is unknown, so an unexpected currency degrades to
 * "show the stored amount" rather than to a wrong number.
 */
export function convertCents(
  cents: number,
  from: string = BASE_CURRENCY,
  to: string = BASE_CURRENCY,
): number {
  if (from === to || !canConvert(from, to)) return cents;
  return Math.round((cents / DISPLAY_RATES[from]) * DISPLAY_RATES[to]);
}

/** Format a price stored in minor units into a localized currency string. */
export function formatPrice(
  cents: number,
  currency = BASE_CURRENCY,
  locale = BASE_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Prefix marking a converted (approximate) amount. */
export const APPROX_PREFIX = "≈\u00a0";

/**
 * Convert a stored price into the shopper's country currency and format it.
 * A converted amount is approximate and carries the "≈" prefix; prices in the
 * product's own currency are exact. Falls back to the product's own currency
 * when the pair is not convertible.
 */
export function formatPriceIn(
  cents: number,
  currency: string,
  country: { currency: string; locale: string },
): string {
  const target = canConvert(currency, country.currency)
    ? country.currency
    : currency;
  const formatted = formatPrice(
    convertCents(cents, currency, target),
    target,
    country.locale,
  );
  return target === currency ? formatted : APPROX_PREFIX + formatted;
}

/**
 * Instalment term shown under prices ("X ₽ / мес · N мес."), or 0 to hide the
 * line. Off by default: advertising an instalment plan requires a real one
 * (a bank partner or the payment provider's "Оплата частями"). Set
 * NEXT_PUBLIC_INSTALLMENT_MONTHS at build time to enable it.
 */
export const INSTALLMENT_MONTHS = Math.max(
  0,
  Math.floor(Number(process.env.NEXT_PUBLIC_INSTALLMENT_MONTHS) || 0),
);

/** Format a monthly installment (price split over `months`). */
export function formatInstallment(
  cents: number,
  months: number,
  currency = BASE_CURRENCY,
  locale = BASE_LOCALE,
): string {
  const perMonth = Math.round(cents / months);
  return formatPrice(perMonth, currency, locale);
}

/** Installment amount converted into the shopper's country currency. */
export function formatInstallmentIn(
  cents: number,
  months: number,
  currency: string,
  country: { currency: string; locale: string },
): string {
  return formatPriceIn(Math.round(cents / months), currency, country);
}
