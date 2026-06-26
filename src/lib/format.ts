/** Format a price stored in cents into a localized currency string. */
export function formatPrice(
  cents: number,
  currency = "EUR",
  locale = "en-IE",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Format a monthly installment (price split over `months`). */
export function formatInstallment(
  cents: number,
  months: number,
  currency = "EUR",
  locale = "en-IE",
): string {
  const perMonth = Math.round(cents / months);
  return formatPrice(perMonth, currency, locale);
}
