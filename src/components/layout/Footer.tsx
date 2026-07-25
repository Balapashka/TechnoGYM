"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { footerColumns, socialLinks, legalLinks } from "@/lib/nav";
import { NewsletterForm } from "./NewsletterForm";
import { useTranslation } from "@/i18n/useTranslation";

/** Site footer: newsletter, link columns, social, legal + company line. */
export function Footer() {
  const t = useTranslation();

  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="mb-2 text-2xl font-black uppercase">{t("footer.joinUs")}</p>
          <p className="mb-5 text-sm text-white/70">
            {t("footer.getTipsAndOffers")}
          </p>
          <NewsletterForm />
        </div>

        {footerColumns.map((col) => (
          <div key={col.key}>
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-white/60">
              {t(col.key)}
            </p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={`${col.key}-${link.href}-${link.key}`}>
                  <Link
                    href={link.href}
                    className="link-slide inline-block text-sm text-white/85 hover:text-accent"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6">
        <Logo />
        <ul className="flex flex-wrap gap-4 text-xs uppercase tracking-wide">
          {socialLinks.map((s) => (
            <li key={s.label}>
              <Link
                href={s.href}
                className="nav-underline text-white/70 hover:text-accent"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 py-6 text-xs text-white/60">
        {legalLinks.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-accent">
            {t(l.key)}
          </Link>
        ))}
        <span className="basis-full pt-2 text-white/40">
          {t("footer.legalDisclaimer")}
        </span>
      </div>
    </footer>
  );
}
