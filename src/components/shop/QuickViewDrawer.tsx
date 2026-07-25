"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuickViewStore } from "@/store/quickview-store";
import { useCartStore } from "@/store/cart-store";
import { useCartUiStore } from "@/store/cart-ui-store";
import { useLocaleStore } from "@/store/locale-store";
import { formatPrice, formatInstallment } from "@/lib/format";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Global slide-in panel. Opens from the right with product details and a quick
 * add-to-cart, driven by the quick-view store. Mounted once in the layout.
 */
export function QuickViewDrawer() {
  const product = useQuickViewStore((s) => s.product);
  const close = useQuickViewStore((s) => s.close);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartUiStore((s) => s.openCart);
  const locale = useLocaleStore((s) => s.country.locale);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "/placeholders/product-1000x1000.svg",
      variantId: null,
      variantName: product.variants[0]?.name ?? "Standard",
      unitPriceCents: product.priceCents,
      currency: product.currency,
    });
    setAdded(true);
    close();
    openCart();
  };

  return (
    <AnimatePresence>
      {product && (
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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-stone px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                Quick view
              </p>
              <button
                onClick={close}
                aria-label="Close"
                className="hover-lift grid h-9 w-9 place-items-center rounded-full border border-stone text-lg"
              >
                ×
              </button>
            </div>

            <motion.div
              className="relative aspect-square overflow-hidden bg-mist"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.5, ease }}
            >
              {product.badge && (
                <span className="absolute left-4 top-4 z-10 rounded bg-accent px-2 py-1 text-xs font-bold uppercase">
                  {product.badge}
                </span>
              )}
              <Image
                src={product.images[0] ?? "/placeholders/product-1000x1000.svg"}
                alt={product.name}
                fill
                sizes="28rem"
                className="object-contain p-8"
              />
            </motion.div>

            <div className="flex flex-1 flex-col gap-4 p-6">
              <motion.h2
                className="text-2xl font-black uppercase"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4, ease }}
              >
                {product.name}
              </motion.h2>
              <p className="text-sm text-ink-soft">{product.description}</p>

              {product.features.length > 0 && (
                <ul className="space-y-1.5">
                  {product.features.map((f, i) => (
                    <motion.li
                      key={f}
                      className="flex items-center gap-2 text-sm"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.24 + i * 0.06, duration: 0.35 }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {f}
                    </motion.li>
                  ))}
                </ul>
              )}

              <div className="mt-auto space-y-3 border-t border-stone pt-4">
                <div>
                  <p className="text-2xl font-black">
                    {formatPrice(product.priceCents, product.currency, locale)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {formatInstallment(product.priceCents, 36, product.currency, locale)}
                    /mo · 36 months
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAdd}
                    className="hover-lift flex-1 rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
                  >
                    {added ? "Added ✓" : "Add to cart"}
                  </button>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={close}
                    className="hover-lift rounded-full border border-ink px-6 py-3 text-sm font-bold uppercase"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
