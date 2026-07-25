import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Badge } from "@/components/ui/Badge";
import { Price, Installment } from "@/components/ui/Price";
import { categoryColor } from "@/lib/category-color";
import { QuickViewButton } from "./QuickViewButton";
import { ProductOrigin } from "./ProductOrigin";
import type { ProductDTO } from "@/lib/catalog";

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
          sizes="(max-width: 768px) 50vw, 25vw"
          imgClassName="transition-transform duration-300 group-hover:scale-105"
        />
        <QuickViewButton product={product} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <ProductOrigin
          brand={product.brand}
          originCountry={product.originCountry}
        />
        <h3 className="text-sm font-bold uppercase tracking-wide">
          {product.name}
        </h3>
        <Price
          cents={product.priceCents}
          currency={product.currency}
          className="mt-auto text-sm"
        />
        <Installment
          cents={product.priceCents}
          currency={product.currency}
          className="text-xs text-ink-soft"
        />
      </div>
    </Link>
  );
}
