"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { useTranslation } from "@/i18n/useTranslation";
import type { ProductDTO } from "@/lib/catalog";

/**
 * Horizontally scrollable row of product cards.
 *
 * Pass `titleKey` (a dictionary path) so the heading follows the language
 * switch; `title` stays available for callers with an already-resolved string.
 */
export function ProductCarousel({
  title,
  titleKey,
  products,
}: {
  title?: string;
  titleKey?: string;
  products: ProductDTO[];
}) {
  const t = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  const heading = titleKey ? t(titleKey) : (title ?? "");


  return (
    <section className="container-page py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight md:text-3xl">
          {heading}
        </h2>
        <div className="hidden gap-2 md:flex">
          <button
            aria-label={t("landing.previous")}
            onClick={() => emblaApi?.scrollPrev()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink"
          >
            ‹
          </button>
          <button
            aria-label={t("landing.next")}
            onClick={() => emblaApi?.scrollNext()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink"
          >
            ›
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_24%]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
