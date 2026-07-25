import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
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

/** Tiled overview of every category with product counts and price-from. */
export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
      products: {
        orderBy: { priceCents: "asc" },
        take: 1,
        select: { priceCents: true, currency: true },
      },
    },
  });

  const total = categories.reduce((n, c) => n + c._count.products, 0);

  // Vary tile sizes for a masonry-like rhythm.
  const span = (i: number) =>
    i % 5 === 0 ? "sm:col-span-2 sm:row-span-2" : "";

  return (
    <div className="container-page flex-1 py-12">
      <Reveal>
        <CollectionsIntro total={total} categories={categories.length} />
      </Reveal>

      <Stagger className="mt-10 grid auto-rows-[12rem] grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((c, i) => (
          <StaggerItem key={c.id} className={span(i)}>
            <Link
              href={`/category/${c.slug}`}
              className="hover-lift group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone bg-gradient-to-br from-mist to-paper p-6"
            >
              <span className="absolute -right-6 -top-8 text-[8rem] font-black leading-none text-stone/60 transition-transform duration-500 group-hover:scale-110">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative">
                <CollectionCount count={c._count.products} />
              </div>
              <div className="relative">
                <h2 className="text-2xl font-black uppercase leading-tight">
                  <CategoryName slug={c.slug} fallback={c.name} />
                </h2>
                {c.products[0] && (
                  <CollectionPriceFrom
                    cents={c.products[0].priceCents}
                    currency={c.products[0].currency}
                  />
                )}
                <CollectionShopLabel />
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
