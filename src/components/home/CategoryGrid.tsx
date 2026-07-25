"use client";

import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { useTranslation } from "@/i18n/useTranslation";
import { categoryName } from "@/i18n/translations";

type CategoryTile = { slug: string; name: string; image: string | null };

/** "Shop by category" grid of image tiles. */
export function CategoryGrid({ categories }: { categories: CategoryTile[] }) {
  const t = useTranslation();

  return (
    <section className="container-page py-12">
      <h2 className="mb-6 text-2xl font-black uppercase tracking-tight md:text-3xl">
        {t("common.shopByCategory")}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c) => {
          const label = categoryName(t.locale, c.slug, c.name);
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden bg-mist"
            >
              <Media
                src={c.image}
                alt={label}
                sizes="(max-width: 768px) 50vw, 25vw"
                imgClassName="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-4 left-4 z-10 bg-accent px-2 py-1 text-sm font-black uppercase text-ink">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
