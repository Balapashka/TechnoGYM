"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useCartStore, cartCount } from "@/store/cart-store";
import { useCartUiStore } from "@/store/cart-ui-store";

/** Cart button that opens the slide-in drawer, with a live item-count badge. */
export function CartButton() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartUiStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = cartCount(items);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Cart"
      className="relative inline-flex items-center"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M6 6 5 3H2" />
      </svg>
      {mounted && count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 18 }}
          className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink"
        >
          {count}
        </motion.span>
      )}
    </button>
  );
}
