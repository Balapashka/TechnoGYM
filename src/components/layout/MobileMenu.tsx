"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { shopColumns, primaryNav } from "@/lib/nav";
import { useTranslation } from "@/i18n/useTranslation";

const FOCUSABLE = "a[href], button:not([disabled])";

/**
 * Burger-triggered navigation drawer for screens below `lg`. Locks page
 * scroll, traps focus inside the panel and closes on ESC / backdrop click;
 * focus returns to the burger button when the drawer closes.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = useTranslation();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active);
      if (e.shiftKey ? active === first || !inside : active === last || !inside) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(frame);
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded-full border border-stone"
      >
        <span aria-hidden className="flex w-4 flex-col gap-1">
          <span className="h-0.5 rounded bg-ink" />
          <span className="h-0.5 rounded bg-ink" />
          <span className="h-0.5 rounded bg-ink" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={close}
            />
            <motion.aside
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.menu")}
              className="fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-stone px-6 py-4">
                <p className="text-sm font-black uppercase tracking-widest">
                  {t("nav.menu")}
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("nav.closeMenu")}
                  className="hover-lift grid h-9 w-9 place-items-center rounded-full border border-stone text-lg"
                >
                  ×
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-6">
                <ul className="space-y-1">
                  {primaryNav.map((item) => (
                    <li key={item.href + item.key}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="block py-2 text-base font-bold uppercase tracking-wide"
                      >
                        {t(item.key)}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/business"
                      onClick={close}
                      className="block py-2 text-base font-bold uppercase tracking-wide"
                    >
                      {t("common.forBusiness")}
                    </Link>
                  </li>
                </ul>

                {shopColumns.map((col, ci) => (
                  <motion.div
                    key={col.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + ci * 0.05, duration: 0.3 }}
                    className="mt-6 border-t border-stone pt-5"
                  >
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-soft">
                      {t(col.key)}
                    </p>
                    <ul className="space-y-2">
                      {col.links.map((link) => (
                        <li key={link.href + link.key}>
                          <Link
                            href={link.href}
                            onClick={close}
                            className="link-slide block text-sm text-ink-soft"
                          >
                            {t(link.key)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
