"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { shopColumnsFrom, type ShopNav } from "@/lib/nav-groups";
import { categoryName } from "@/i18n/translations";
import { useTranslation } from "@/i18n/useTranslation";

/** "Shop" trigger that reveals an animated mega-menu panel on hover/focus. */
export function MegaMenu({ nav }: { nav: ShopNav }) {
  const columns = shopColumnsFrom(nav);
  const [open, setOpen] = useState(false);
  const t = useTranslation();

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="nav-underline whitespace-nowrap py-2 text-sm font-semibold uppercase tracking-wide"
      >
        {t("nav.shop")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full z-40 w-[52rem] max-w-[calc(100vw-4rem)] rounded-b-2xl border-t-2 border-ink bg-paper p-8 shadow-2xl"
            role="menu"
          >
            <div className="grid grid-cols-4 gap-8">
              {columns.map((col, ci) => (
                <motion.div
                  key={col.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + ci * 0.05, duration: 0.3 }}
                >
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-soft">
                    {t(col.key)}
                  </p>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="link-slide block text-sm text-ink-soft"
                          onClick={() => setOpen(false)}
                        >
                          {link.key
                            ? t(link.key)
                            : link.slug
                              ? categoryName(t.locale, link.slug, link.label)
                              : link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
