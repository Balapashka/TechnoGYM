import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/catalog";
import { BASE_CURRENCY } from "@/lib/format";
import { Media } from "@/components/ui/Media";
import { CategoryName } from "@/components/shop/CategoryName";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Reveal } from "@/components/motion/Reveal";
import { CollectionsIntro } from "./CollectionsIntro";
import {
  CollectionCount,
  CollectionPriceFrom,
  CollectionShopLabel,
} from "./CollectionTileMeta";

export const metadata: Metadata = { title: "Коллекции — SPORT LINER" };
export const dynamic = "force-dynamic";

/**
 * Tiled overview of every non-empty category: photo, product count and
 * price-from. Empty categories are left out so no tile leads nowhere.
 */
export default async function CollectionsPage() {
  const [categories, minPrices] = await Promise.all([
    getCategories({ nonEmpty: true }),
    // Cheapest product with a *visible* price: quote-only imports must not
    // leak their amount through the "от …" tile label.
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { priceOnRequest: false },
      _min: { priceCents: true },
    }),
  ]);
  const minBy = new Map(minPrices.map((m) => [m.categoryId, m._min.priceCents]));
  const total = categories.reduce((n, c) => n + c.count, 0);

  // Vary tile sizes for a masonry-like rhythm.
  const span = (i: number) =>
    i % 5 === 0 ? "sm:col-span-2 sm:row-span-2" : "";

  return (
    <main className="container-page flex-1 py-12">
      <Reveal>
        <CollectionsIntro total={total} categories={categories.length} />
      </Reveal>

      <Stagger className="mt-10 grid auto-rows-[14rem] grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((c, i) => {
          const min = minBy.get(c.id);
          return (
            <StaggerItem key={c.id} className={span(i)}>
              <Link
                href={`/category/${c.slug}`}
                className="hover-lift group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-ink p-5 text-paper sm:p-6"
              >
                <Media
                  src={c.image}
                  alt=""
                  sizes={i % 5 === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                  fallbackClassName="bg-gradient-to-br from-zinc-700 to-ink"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                <span className="absolute -right-4 -top-6 text-[6rem] font-black leading-none text-white/15 transition-transform duration-500 group-hover:scale-110 sm:text-[8rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative">
                  <CollectionCount count={c.count} className="text-white/80" />
                </div>
                <div className="relative">
                  <h2 className="text-xl font-black uppercase leading-tight sm:text-2xl">
                    <CategoryName slug={c.slug} fallback={c.name} />
                  </h2>
                  <CollectionPriceFrom
                    price={min != null ? { cents: min, currency: BASE_CURRENCY } : null}
                    className="text-white/80"
                  />
                  <CollectionShopLabel />
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </main>
  );
}
