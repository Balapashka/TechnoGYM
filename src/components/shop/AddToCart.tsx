"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useCartUiStore } from "@/store/cart-ui-store";
import { formatPrice, formatInstallment } from "@/lib/format";
import { useLocaleStore } from "@/store/locale-store";
import type { ProductDTO } from "@/lib/catalog";

/** Variant + quantity selector with a sticky add-to-cart bar. */
export function AddToCart({ product }: { product: ProductDTO }) {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.country.locale);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartUiStore((s) => s.openCart);

  const variants = product.variants.length
    ? product.variants
    : [{ id: "default", name: "Standard", priceDeltaCents: 0 }];

  const [variantId, setVariantId] = useState(variants[0].id);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variants, variantId],
  );
  const unitPriceCents = product.priceCents + variant.priceDeltaCents;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "/placeholders/product-1000x1000.svg",
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
        <p className="mb-2 text-xs font-bold uppercase tracking-wide">Version</p>
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
              {v.priceDeltaCents > 0 && (
                <span className="ml-1 text-ink-soft">
                  +{formatPrice(v.priceDeltaCents, product.currency, locale)}
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
            <p className="text-2xl font-black">
              {formatPrice(unitPriceCents, product.currency, locale)}
            </p>
            <p className="text-xs text-ink-soft">
              {formatInstallment(unitPriceCents, 36, product.currency, locale)}
              /mo · 36 months
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong"
            >
              Add to cart
            </button>
            {added && (
              <button
                onClick={() => router.push("/cart")}
                className="rounded border border-ink px-6 py-3 text-sm font-bold uppercase hover:bg-ink hover:text-paper"
              >
                Go to cart
              </button>
            )}
          </div>
        </div>
        {added && (
          <p className="mt-2 text-xs text-ink-soft">Added to your cart.</p>
        )}
      </div>
    </div>
  );
}
