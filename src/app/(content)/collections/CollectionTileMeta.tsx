"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { formatProductCount } from "@/i18n/translations";
import { formatPriceIn } from "@/lib/format";
import { useDisplayCountry } from "@/store/locale-store";

/** "5 товаров" tile label, with the correct Russian declension. */
export function CollectionCount({ count }: { count: number }) {
  const t = useTranslation();

  return (
    <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
      {formatProductCount(t.locale, count)}
    </p>
  );
}

/** "от 12 500 ₽" — converted into the currency of the selected country. */
export function CollectionPriceFrom({
  cents,
  currency,
}: {
  cents: number;
  currency: string;
}) {
  const t = useTranslation();
  const country = useDisplayCountry();

  return (
    <p className="mt-1 text-sm text-ink-soft">
      {t("product.from")} {formatPriceIn(cents, currency, country)}
    </p>
  );
}

/** "Смотреть →" call to action at the bottom of a tile. */
export function CollectionShopLabel() {
  const t = useTranslation();

  return (
    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold uppercase">
      {t("landing.shop")}
      <span className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </span>
  );
}
