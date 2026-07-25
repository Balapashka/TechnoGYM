"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useCartStore,
  cartCount,
  cartTotalCents,
} from "@/store/cart-store";
import { BASE_CURRENCY, formatPriceIn } from "@/lib/format";
import { useDisplayCountry } from "@/store/locale-store";
import { useTranslation } from "@/i18n/useTranslation";
import { useHydrated } from "@/lib/use-hydrated";

/** Cart contents with quantity controls and an order summary. */
export function CartView() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const country = useDisplayCountry();
  const t = useTranslation();

  const mounted = useHydrated();
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-4 text-3xl font-black uppercase">
          {t("cart.emptyCart")}
        </h1>
        <Link
          href="/category/all"
          className="inline-flex rounded bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("cart.browseProducts")}
        </Link>
      </div>
    );
  }

  const total = cartTotalCents(items);
  const currency = items[0]?.currency ?? BASE_CURRENCY;

  return (
    <div className="container-page grid flex-1 gap-10 py-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="mb-6 text-3xl font-black uppercase">
          {t("cart.title")} ({cartCount(items)})
        </h1>
        <ul className="divide-y divide-stone">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.variantId ?? "_"}`}
              className="flex gap-4 py-4"
            >
              <div className="relative h-24 w-24 shrink-0 bg-mist">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-bold uppercase"
                >
                  {item.name}
                </Link>
                {item.variantName && (
                  <span className="text-xs text-ink-soft">
                    {item.variantName}
                  </span>
                )}
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center border border-stone">
                    <button
                      aria-label={t("cart.decrease")}
                      onClick={() =>
                        setQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1,
                        )
                      }
                      className="px-3 py-1"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      aria-label={t("cart.increase")}
                      onClick={() =>
                        setQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity + 1,
                        )
                      }
                      className="px-3 py-1"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-xs text-ink-soft underline"
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
              <div className="text-right font-bold">
                {formatPriceIn(
                  item.unitPriceCents * item.quantity,
                  item.currency,
                  country,
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded border border-stone p-6">
        <h2 className="mb-4 text-lg font-black uppercase">
          {t("cart.summary")}
        </h2>
        <div className="flex justify-between border-b border-stone pb-3 text-sm">
          <span>{t("cart.subtotal")}</span>
          <span className="font-bold">
            {formatPriceIn(total, currency, country)}
          </span>
        </div>
        <div className="flex justify-between py-3 text-sm text-ink-soft">
          <span>{t("cart.shipping")}</span>
          <span>{t("cart.shippingAtCheckout")}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-3 block rounded bg-accent px-6 py-3 text-center text-sm font-bold uppercase text-ink hover:bg-accent-strong"
        >
          {t("cart.checkout")}
        </Link>
      </aside>
    </div>
  );
}
