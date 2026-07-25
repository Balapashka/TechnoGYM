"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore, cartTotalCents, lineKey } from "@/store/cart-store";
import { useCartUiStore } from "@/store/cart-ui-store";
import { useDisplayCountry } from "@/store/locale-store";
import { BASE_CURRENCY, formatPriceIn } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";

/** Global slide-in cart. Opens when an item is added or the cart icon is tapped. */
export function CartDrawer() {
  const router = useRouter();
  const t = useTranslation();
  const open = useCartUiStore((s) => s.open);
  const close = useCartUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const country = useDisplayCountry();

  const total = cartTotalCents(items);
  const currency = items[0]?.currency ?? BASE_CURRENCY;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-stone px-6 py-4">
              <p className="text-sm font-black uppercase tracking-widest">
                {t("cart.yourCart")}
              </p>
              <button
                onClick={close}
                aria-label={t("cart.closeCart")}
                className="hover-lift grid h-9 w-9 place-items-center rounded-full border border-stone text-lg"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center text-ink-soft">
                  <div>
                    <p className="mb-4">{t("cart.emptyCart")}</p>
                    <Link
                      href="/collections"
                      onClick={close}
                      className="hover-lift inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
                    >
                      {t("cart.browseCollections")}
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li
                        key={lineKey(i.productId, i.variantId)}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-3 border-b border-stone pb-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-mist">
                          <Image
                            src={i.image}
                            alt={i.name}
                            fill
                            sizes="5rem"
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="text-sm font-bold uppercase">{i.name}</p>
                          {i.variantName && (
                            <p className="text-xs text-ink-soft">{i.variantName}</p>
                          )}
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                aria-label={t("cart.decrease")}
                                onClick={() =>
                                  setQuantity(i.productId, i.variantId, i.quantity - 1)
                                }
                                className="h-7 w-7 rounded-full border border-stone"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm">
                                {i.quantity}
                              </span>
                              <button
                                aria-label={t("cart.increase")}
                                onClick={() =>
                                  setQuantity(i.productId, i.variantId, i.quantity + 1)
                                }
                                className="h-7 w-7 rounded-full border border-stone"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-bold">
                              {formatPriceIn(i.unitPriceCents * i.quantity, i.currency, country)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(i.productId, i.variantId)}
                          aria-label={t("cart.remove")}
                          className="self-start text-xs text-ink-soft hover:text-red-600"
                        >
                          {t("cart.remove")}
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-stone px-6 py-4">
                <div className="flex justify-between font-bold">
                  <span>{t("cart.total")}</span>
                  <span>{formatPriceIn(total, currency, country)}</span>
                </div>
                <button
                  onClick={() => {
                    close();
                    router.push("/checkout");
                  }}
                  className="hover-lift w-full rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
                >
                  {t("cart.checkout")}
                </button>
                <button
                  onClick={() => {
                    close();
                    router.push("/cart");
                  }}
                  className="hover-lift w-full rounded-full border border-ink px-6 py-3 text-sm font-bold uppercase"
                >
                  {t("cart.viewFullCart")}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
