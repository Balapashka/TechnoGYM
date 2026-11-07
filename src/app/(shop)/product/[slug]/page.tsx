import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/shop/Gallery";
import { AddToCart } from "@/components/shop/AddToCart";
import { CategoryName } from "@/components/shop/CategoryName";
import { ProductOrigin } from "@/components/shop/ProductOrigin";
import { Availability } from "@/components/shop/Availability";
import type { Metadata } from "next";
import { getProductBySlug, type ProductDTO } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";
import { BreadcrumbHome, ProductSpecs, SectionTitle } from "./ProductDetailText";
import { splitFeatures } from "@/lib/features";
import { Description } from "./Description";

/** Absolute URL for an image path ("/uploads/…" → "https://site/uploads/…"). */
function absolute(src: string): string {
  return src.startsWith("/") ? `${SITE_URL}${src}` : src;
}

function shortDescription(text: string): string {
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Товар не найден — SPORT LINER" };
  const description = shortDescription(product.description);
  const image = product.images[0];
  return {
    title: `${product.name} — SPORT LINER`,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: image ? [{ url: absolute(image) }] : undefined,
    },
  };
}

/**
 * schema.org Product for search engines. Quote-only products carry no offer:
 * their price is deliberately not published.
 */
function productJsonLd(product: ProductDTO) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    image: product.images.map(absolute),
    url: `${SITE_URL}/product/${product.slug}`,
    category: product.categoryName,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.priceOnRequest
      ? {}
      : {
          offers: {
            "@type": "Offer",
            priceCurrency: product.currency,
            price: (product.priceCents / 100).toFixed(2),
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/BackOrder",
            seller: { "@type": "Organization", name: BRAND_NAME },
            url: `${SITE_URL}/product/${product.slug}`,
          },
        }),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const { specs, notes } = splitFeatures(product.features);

  return (
    <main className="container-page flex-1 py-8">
      <script
        type="application/ld+json"
        // "<" is escaped so product text can never close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="mb-6 text-xs text-ink-soft">
        <BreadcrumbHome />
        {" / "}
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-ink"
        >
          <CategoryName
            slug={product.categorySlug}
            fallback={product.categoryName}
          />
        </Link>
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              <CategoryName
                slug={product.categorySlug}
                fallback={product.categoryName}
              />
            </p>
            <h1 className="mt-1 text-3xl font-semibold uppercase leading-tight md:text-4xl">
              {product.name}
            </h1>
            <ProductOrigin
              brand={product.brand}
              originCountry={product.originCountry}
              className="mt-2"
            />
            <Availability inStock={product.inStock} className="mt-3" />
            {product.description && (
              <p className="mt-5 line-clamp-4 text-ink-soft">
                {product.description.split(/\n+/)[0]}
              </p>
            )}
          </div>

          <AddToCart product={product} />
        </div>
      </div>

      <div className="mt-16 grid gap-12 border-t border-stone pt-12 lg:grid-cols-2">
        <section>
          <SectionTitle kind="description" />
          <Description text={product.description} />
        </section>
        <section>
          <SectionTitle kind="specs" />
          <ProductSpecs brand={product.brand} originCountry={product.originCountry} />
          {specs.length > 0 && (
            <dl className="divide-y divide-stone border-b border-stone text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 gap-4 py-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {notes.length > 0 && (
            <ul className="mt-6 space-y-2">
              {notes.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
