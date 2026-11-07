"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { footerColumns, legalLinks } from "@/lib/nav";
import { NewsletterForm } from "./NewsletterForm";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_NAME } from "@/lib/brand";
import { categoryName } from "@/i18n/translations";
import { USED_HREF, type ShopNav } from "@/lib/nav-groups";
import {
  phoneHref,
  socialLinksFrom,
  type StoreSettings,
} from "@/lib/settings-shape";

/**
 * Site footer: newsletter, link columns, contacts and messengers from the store
 * settings, legal links and the seller's details (required for an online
 * store by the consumer protection law).
 */
export function Footer({
  settings: s,
  nav,
}: {
  settings: StoreSettings;
  nav: ShopNav;
}) {
  const t = useTranslation();
  const socials = socialLinksFrom(s);
  const requisites = [
    s.legalName,
    s.inn && `${t("footer.inn")} ${s.inn}`,
    s.ogrn && `${t("footer.ogrn")} ${s.ogrn}`,
    s.legalAddress,
  ].filter(Boolean);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="mb-2 text-2xl font-black uppercase">{t("footer.joinUs")}</p>
          <p className="mb-5 text-sm text-white/70">{t("footer.getTipsAndOffers")}</p>
          <NewsletterForm />
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-white/60">
            {t("nav.products")}
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                href="/category/all"
                className="link-slide inline-block text-sm text-white/85 hover:text-accent"
              >
                {t("nav.allProducts")}
              </Link>
            </li>
            {nav.categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="link-slide inline-block text-sm text-white/85 hover:text-accent"
                >
                  {categoryName(t.locale, c.slug, c.name)}
                </Link>
              </li>
            ))}
            {nav.used ? (
              <li>
                <Link
                  href={USED_HREF}
                  className="link-slide inline-block text-sm text-white/85 hover:text-accent"
                >
                  {t("nav.used")}
                </Link>
              </li>
            ) : null}
          </ul>
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

      <div className="container-page flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-white/10 py-6">
        <Logo />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {s.phone && (
            <a href={phoneHref(s.phone)} className="font-bold hover:text-accent">
              {s.phone}
            </a>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`} className="text-white/80 hover:text-accent">
              {s.email}
            </a>
          )}
          {s.workingHours && <span className="text-white/60">{s.workingHours}</span>}
        </div>
        {socials.length > 0 && (
          <ul className="flex flex-wrap gap-4 text-xs uppercase tracking-wide">
            {socials.map((l) => (
              <li key={l.key}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-underline text-white/70 hover:text-accent"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="container-page flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 py-6 text-xs text-white/60">
        {legalLinks.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-accent">
            {t(l.key)}
          </Link>
        ))}
        <span className="basis-full pt-2 text-white/50">
          © {year} {BRAND_NAME}. {t("footer.rights")}
          {requisites.length > 0 && <> {requisites.join(", ")}.</>}
        </span>
        <span className="basis-full text-white/40">{t("footer.legalDisclaimer")}</span>
      </div>
    </footer>
  );
}
