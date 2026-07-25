import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Price, Installment } from "@/components/ui/Price";
import { categoryColor } from "@/lib/category-color";
import { QuickViewButton } from "./QuickViewButton";
import { ProductOrigin } from "./ProductOrigin";
import type { ProductDTO } from "@/lib/catalog";

/** Product card used in carousels and the catalog grid. */
export function ProductCard({ product }: { product: ProductDTO }) {
  const image = product.images[0] ?? "/placeholders/product-1000x1000.svg";
  return (
    <Link
      href={`/product/${product.slug}`}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-xl border border-stone bg-paper"
    >
      <div className={`relative aspect-square overflow-hidden ${categoryColor(product.categorySlug)}`}>
        {product.badge && (
          <Badge className="absolute left-3 top-3 z-10">{product.badge}</Badge>
        )}
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
