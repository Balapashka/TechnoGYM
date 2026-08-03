import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Badge } from "@/components/ui/Badge";
import { PriceOrRequest, ProductInstallment } from "@/components/ui/Price";
import { categoryColor } from "@/lib/category-color";
import { QuickViewButton } from "./QuickViewButton";
import { CompareButton } from "./CompareButton";
import { RequestPriceButton } from "./RequestPriceButton";
import { ProductOrigin } from "./ProductOrigin";
import { Availability } from "./Availability";
import type { ProductDTO } from "@/lib/catalog";

/**
 * Rendered width of a card image, so the browser downloads the smallest
 * srcset candidate that fits. Up to ~180 cards live on /category/all, so an
 * over-stated width is paid for once per visible card.
 *
 * Derived from the two layouts that use this card, against `.container-page`
 * (max-width 90rem, padding-inline 1rem / 2rem from 768px):
 *  - below 1024px the catalog grid is 2 columns → (100vw - 48px) / 2, i.e. a
 *    shade under 50vw;
 *  - from 1024px it is 3 columns beside the 16rem filter sidebar → ~24.4vw at
 *    1440px, so 25vw is a safe ceiling;
 *  - past 1440px the container stops growing, so the card is a fixed 352px
 *    (330px in the homepage carousel) and vw units would only over-fetch.
 *
 * The previous value switched to 25vw at 768px, where the grid is still 2
 * columns — those widths asked for an image half the size they render at.
 *
 * No `priority`: only above-the-fold LCP images take it, and a card is never
 * guaranteed to be one. next/image therefore lazy-loads every card image,
 * which is what keeps a 180-card page from firing 180 requests at once.
 */
const CARD_IMAGE_SIZES =
  "(min-width: 1440px) 352px, (min-width: 1024px) 25vw, 50vw";

/** Product card used in carousels and the catalog grid. */
export function ProductCard({ product }: { product: ProductDTO }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-xl border border-stone bg-paper"
    >
      <div className={`relative aspect-square overflow-hidden ${categoryColor(product.categorySlug)}`}>
        {product.badge && (
          <Badge className="absolute left-3 top-3 z-10">{product.badge}</Badge>
        )}
        <Media
          src={product.images[0] ?? null}
          alt={product.name}
          sizes={CARD_IMAGE_SIZES}
          imgClassName="transition-transform duration-300 group-hover:scale-105"
        />
        <QuickViewButton product={product} />
        <CompareButton product={product} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <ProductOrigin
          brand={product.brand}
          originCountry={product.originCountry}
        />
        <h3 className="text-sm font-bold uppercase tracking-wide">
          {product.name}
        </h3>
        <PriceOrRequest product={product} className="mt-auto text-sm" />
        <ProductInstallment
          product={product}
          className="text-xs text-ink-soft"
        />
        <Availability inStock={product.inStock} className="mt-1" />
        {product.priceOnRequest && <RequestPriceButton product={product} />}
      </div>
    </Link>
  );
}
