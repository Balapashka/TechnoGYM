"use client";

import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { useTranslation } from "@/i18n/useTranslation";
import { categoryName, formatProductCount } from "@/i18n/translations";

type CategoryTile = { slug: string; name: string; image: string | null; count?: number };

/** "Shop by category" grid of image tiles. */
export function CategoryGrid({ categories }: { categories: CategoryTile[] }) {
  const t = useTranslation();

  return (
    <section className="container-page py-14 md:py-20">
      <h2 className="mb-8 text-3xl font-semibold uppercase md:text-5xl">
        {t("home.categoriesTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
        {categories.map((c) => {
          const label = categoryName(t.locale, c.slug, c.name);
          return (
            <Link key={c.slug} href={`/category/${c.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-mist">
                <Media
                  src={c.image}
                  alt={label}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  fit="contain"
                  imgClassName="p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </div>
              <p className="mt-3 font-display text-sm font-semibold uppercase group-hover:underline">
                {label}
              </p>
              {c.count != null && (
                <p className="text-xs text-ink-soft">{formatProductCount(t.locale, c.count)}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
