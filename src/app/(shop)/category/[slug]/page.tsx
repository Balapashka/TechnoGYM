import { notFound } from "next/navigation";
import { CatalogView } from "@/components/shop/CatalogView";
import {
  getAllProducts,
  getProductsByCategory,
  getCategories,
} from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = slug === "all" ? "All products" : titleize(slug);
  return { title: `${title} — Movigym` };
}

function titleize(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "all") {
    const products = await getAllProducts();
    return <CategoryLayout title="All products" count={products.length} view={products} />;
  }

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);
  return (
    <CategoryLayout
      title={category.name}
      count={products.length}
      view={products}
    />
  );
}

function CategoryLayout({
  title,
  count,
  view,
}: {
  title: string;
  count: number;
  view: Awaited<ReturnType<typeof getAllProducts>>;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="border-b border-stone">
        <div className="container-page py-8">
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Catalog
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{count} products</p>
        </div>
      </div>
      <CatalogView products={view} />
    </main>
  );
}
