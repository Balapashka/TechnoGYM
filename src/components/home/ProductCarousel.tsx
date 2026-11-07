"use client";

import Link from "next/link";
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
  leadKey,
  viewAllHref,
  products,
}: {
  title?: string;
  titleKey?: string;
  /** Optional one-line subtitle (dictionary path). */
  leadKey?: string;
  /** Optional "view all" link next to the arrows. */
  viewAllHref?: string;
  products: ProductDTO[];
}) {
  const t = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  const heading = titleKey ? t(titleKey) : (title ?? "");
  if (products.length === 0) return null;


  return (
    <section className="container-page py-14 md:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold uppercase md:text-5xl">{heading}</h2>
          {leadKey && <p className="mt-3 text-ink-soft">{t(leadKey)}</p>}
        </div>
        <div className="flex items-center gap-4">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="border-b border-ink pb-0.5 text-xs font-semibold uppercase tracking-wider"
            >
              {t("home.viewAll")}
            </Link>
          )}
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
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
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
