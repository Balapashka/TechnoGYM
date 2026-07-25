import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/shop/Gallery";
import { AddToCart } from "@/components/shop/AddToCart";
import { CategoryName } from "@/components/shop/CategoryName";
import { getProductBySlug } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — Movigym` : "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="container-page flex-1 py-8">
      <nav className="mb-6 text-xs text-ink-soft">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
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
            <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              {product.name}
            </h1>
          </div>

          <p className="text-ink-soft">{product.description}</p>

          {product.features.length > 0 && (
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <AddToCart product={product} />
        </div>
      </div>
    </main>
  );
}
