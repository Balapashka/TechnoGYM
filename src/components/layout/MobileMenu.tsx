"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { shopColumns, primaryNav } from "@/lib/nav";
import { useTranslation } from "@/i18n/useTranslation";
import { useLocaleStore, COUNTRIES } from "@/store/locale-store";
import { LOCALES } from "@/i18n/translations";
import { useHydrated } from "@/lib/use-hydrated";
import { Logo } from "./Logo";
import type { SessionUser } from "@/lib/auth";

const FOCUSABLE = "a[href], button:not([disabled]), select";

/**
 * Burger-triggered full-screen navigation drawer for screens below `lg`.
 * Locks page scroll, traps focus inside the panel and closes on ESC or any
 * link click; focus returns to the burger button when the drawer closes.
 * The footer carries the language/country switcher and auth actions that are
 * hidden from the mobile header.
 */
export function MobileMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = useTranslation();
  // The panel is portaled to <body>: the sticky header's backdrop-blur makes
  // it the containing block for fixed descendants, which would pin the drawer
  // to the 64px header box instead of the viewport.
  const mounted = useHydrated();

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
        className="grid h-11 w-11 place-items-center rounded-full border border-stone"
      >
        <span aria-hidden className="flex w-4 flex-col gap-1">
          <span className="h-0.5 rounded bg-ink" />
          <span className="h-0.5 rounded bg-ink" />
          <span className="h-0.5 rounded bg-ink" />
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.aside
                ref={panelRef}
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label={t("nav.menu")}
                className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-paper lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
              >
                <div className="flex items-center justify-between border-b border-stone px-6 py-3">
                  <Logo />
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t("nav.closeMenu")}
                    className="hover-lift grid h-11 w-11 place-items-center rounded-full border border-stone text-xl"
                  >
                    ×
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-6">
                  <ul className="flex flex-col gap-4">
                    <li>
                      <Link
                        href="/category/all"
                        onClick={close}
                        className="block text-lg font-black uppercase tracking-wide"
                      >
                        {t("nav.shop")}
                      </Link>
                    </li>
                    {primaryNav.map((item) => (
                      <li key={item.href + item.key}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className="block text-lg font-black uppercase tracking-wide"
                        >
                          {t(item.key)}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/business"
                        onClick={close}
                        className="block text-lg font-black uppercase tracking-wide"
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

                <MobileMenuFooter user={user} onClose={close} />
              </motion.aside>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

/** Drawer footer: language + country switcher and login/registration actions. */
function MobileMenuFooter({
  user,
  onClose,
}: {
  user: SessionUser | null;
  onClose: () => void;
}) {
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);
  const country = useLocaleStore((s) => s.country);
  const setCountry = useLocaleStore((s) => s.setCountry);
  const t = useTranslation();

  // Language/country come from persisted state, so render only after mount to
  // keep the server markup and the first client render identical.
  const mounted = useHydrated();
  if (!mounted) return null;

  return (
    <div className="border-t border-stone bg-mist/50 px-6 py-5">
      <div className="flex items-center gap-3">
        <div
          role="group"
          aria-label={t("locale.language")}
          className="flex items-center rounded-full border border-stone"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              aria-pressed={language === l.code}
              title={l.name}
              className={`rounded-full px-3.5 py-2 text-xs font-bold uppercase transition ${
                language === l.code ? "bg-ink text-paper" : "text-ink-soft"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <select
          aria-label={t("locale.country")}
          value={country.code}
          onChange={(e) => setCountry(e.target.value)}
          className="min-w-0 flex-1 rounded-full border border-stone bg-paper px-3 py-2 text-xs font-semibold"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm font-semibold">
        {user ? (
          <Link
            href="/account"
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 uppercase tracking-wide text-paper"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[10px] font-black text-ink">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </span>
            {t("common.account")}
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="flex-1 rounded-full border border-stone px-4 py-2.5 text-center uppercase tracking-wide"
            >
              {t("common.login")}
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="flex-1 rounded-full bg-ink px-4 py-2.5 text-center uppercase tracking-wide text-paper"
            >
              {t("common.join")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
