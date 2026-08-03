"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useCartUiStore } from "@/store/cart-ui-store";
import { useQuoteStore } from "@/store/quote-store";
import { resolveMediaSrc } from "@/lib/media";
import { formatPriceIn, formatInstallmentIn } from "@/lib/format";
import { useDisplayCountry } from "@/store/locale-store";
import { useTranslation } from "@/i18n/useTranslation";
import type { ProductDTO } from "@/lib/catalog";

/**
 * Variant selector with a sticky purchase bar. Imported equipment is sold to
 * order (`priceOnRequest`): it never shows a price or reaches the cart — the
 * bar offers a quote request instead.
 */
export function AddToCart({ product }: { product: ProductDTO }) {
  const router = useRouter();
  const country = useDisplayCountry();
  const t = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartUiStore((s) => s.openCart);
  const openQuote = useQuoteStore((s) => s.open);

  const onRequest = product.priceOnRequest;

  // Memoized so the fallback array keeps a stable identity between renders.
  const variants = useMemo(
    () =>
      product.variants.length
        ? product.variants
        : [
            {
              id: "default",
              name: t("product.standardConfig"),
              priceDeltaCents: 0,
            },
          ],
    [product.variants, t],
  );

  const [variantId, setVariantId] = useState(variants[0].id);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variants, variantId],
  );
  const unitPriceCents = product.priceCents + variant.priceDeltaCents;

  const handleAdd = () => {
    // Unreachable from the UI — a second barrier so a quoted product can never
    // end up in the cart.
    if (onRequest) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? resolveMediaSrc("productCard"),
      variantId: variant.id === "default" ? null : variant.id,
      variantName: variant.name,
      unitPriceCents,
      currency: product.currency,
    });
    setAdded(true);
    openCart();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide">
          {t("product.configuration")}
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariantId(v.id)}
              aria-pressed={v.id === variantId}
              className={`rounded border px-4 py-2 text-sm ${
                v.id === variantId
                  ? "border-ink bg-mist font-bold"
                  : "border-stone"
              }`}
            >
              {v.name}
              {/* A surcharge is still a price — hidden on quoted products. */}
              {!onRequest && v.priceDeltaCents > 0 && (
                <span className="ml-1 text-ink-soft">
                  +{formatPriceIn(v.priceDeltaCents, product.currency, country)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky purchase bar */}
      <div className="sticky bottom-0 -mx-4 border-t border-stone bg-paper px-4 py-4 md:mx-0 md:rounded md:border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {onRequest ? (
              <p className="text-2xl font-black uppercase tracking-tight">
                {t("product.priceOnRequest")}
              </p>
            ) : (
              <>
                <p className="text-2xl font-black">
                  {formatPriceIn(unitPriceCents, product.currency, country)}
                </p>
                <p className="text-xs text-ink-soft">
                  {t("product.installment", {
                    amount: formatInstallmentIn(
                      unitPriceCents,
                      36,
                      product.currency,
                      country,
                    ),
                    months: 36,
                  })}
                </p>
              </>
            )}
          </div>
          <div className="flex gap-3">
            {onRequest ? (
              <button
                onClick={() => openQuote({ id: product.id, name: product.name })}
                className="rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong"
              >
                {t("product.requestPrice")}
              </button>
            ) : (
              <>
                <button
                  onClick={handleAdd}
                  className="rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong"
                >
                  {t("common.addToCart")}
                </button>
                {added && (
                  <button
                    onClick={() => router.push("/cart")}
                    className="rounded border border-ink px-6 py-3 text-sm font-bold uppercase hover:bg-ink hover:text-paper"
                  >
                    {t("product.goToCart")}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {!onRequest && added && (
          <p className="mt-2 text-xs text-ink-soft">
            {t("product.addedToYourCart")}
          </p>
        )}
      </div>
    </div>
  );
}
