"use client";

import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { useTranslation } from "@/i18n/useTranslation";

/** Full-bleed B2B call to action, the "for your business" block. */
export function BusinessBand() {
  const t = useTranslation();
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <Media
        src="/media/business.jpg"
        alt=""
        sizes="100vw"
        imgClassName="opacity-60"
        fallbackClassName="bg-ink"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="container-page relative py-24 md:py-32">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
          {t("home.businessEyebrow")}
        </p>
        <h2 className="max-w-2xl text-3xl font-semibold uppercase leading-tight md:text-5xl">
          {t("home.businessTitle")}
        </h2>
        <p className="mt-4 max-w-xl text-white/80">{t("home.businessLead")}</p>
        <Link
          href="/business"
          className="hover-lift mt-8 inline-flex rounded-full bg-paper px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink"
        >
          {t("home.businessCta")}
        </Link>
      </div>
    </section>
  );
}
