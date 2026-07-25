"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Cross-link banner into the tiled collections page. Client-side so the copy
 * follows the language switch (the home page itself is a server component).
 */
export function CollectionsBanner({ count }: { count: number }) {
  const t = useTranslation();

  return (
    <Reveal>
      <section className="container-page py-12">
        <div className="hover-lift group relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-paper md:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,237,0,0.25),transparent_55%)]" />
          <div className="relative max-w-xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
              {t("landing.collectionsCount", { count })}
            </p>
            <h2 className="text-3xl font-black uppercase md:text-5xl">
              {t("common.findYourTrainingSpace")}
            </h2>
            <p className="mt-3 text-white/70">{t("common.browseEveryCategory")}</p>
            <Link
              href="/collections"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold uppercase text-ink"
            >
              {t("common.exploreCollections")}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
