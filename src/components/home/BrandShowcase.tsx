"use client";

import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";
import { useTranslation } from "@/i18n/useTranslation";
import { brandSlug } from "@/lib/catalog-url";
import type { BrandShowcase as Brand } from "@/lib/catalog";

/** Short brand blurbs; an unknown brand simply shows its model count. */
const BLURB: Record<string, string> = {
  technogym: "home.brand_technogym",
  "unix-fit": "home.brand_unixfit",
};

/** Brand cards: photo, origin, availability, short story, link to models. */
export function BrandShowcase({ brands }: { brands: Brand[] }) {
  const t = useTranslation();
  if (brands.length === 0) return null;
  const list = brands.slice(0, 3);

  return (
    <section className="container-page py-16 md:py-24">
      <Reveal>
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold uppercase md:text-5xl">
            {t("home.brandsTitle")}
          </h2>
          <p className="mt-3 text-ink-soft">{t("home.brandsLead")}</p>
        </div>
      </Reveal>
      <div className={`grid gap-6 ${list.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {list.map((b, i) => {
          const slug = brandSlug(b.name);
          const madeToOrder = b.inStock === 0;
          return (
            <Reveal key={b.name} delay={i * 0.08}>
              <Link
                href={`/brand/${slug}`}
                className="group block h-full"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-mist">
                  <Media
                    src={b.image}
                    alt={b.name}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    fit="contain"
                    imgClassName="p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                    {madeToOrder ? t("home.brandToOrder") : t("home.brandInStock")}
                  </span>
                </div>
                <div className="pt-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
                    {b.originCountry} · {t("home.brandModels", { count: b.count })}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold uppercase">{b.name}</h3>
                  {BLURB[slug] && (
                    <p className="mt-2 text-sm text-ink-soft">{t(BLURB[slug])}</p>
                  )}
                  <span className="mt-4 inline-block border-b border-ink pb-0.5 text-xs font-semibold uppercase tracking-wider">
                    {t("home.brandView")}
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
