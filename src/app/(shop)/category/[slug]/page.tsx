import { notFound } from "next/navigation";
import { CatalogView } from "@/components/shop/CatalogView";
import { CatalogHeader } from "@/components/shop/CatalogHeader";
import {
  getAllProducts,
  getProductsByCategory,
  getCategories,
} from "@/lib/catalog";
import { DEFAULT_LOCALE, categoryName } from "@/i18n/translations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "all") return { title: "Все товары — SPORT LINER" };

  // Titles are not reactive, so they use the default locale's category name.
  const categories = await getCategories();
  const dbName = categories.find((c) => c.slug === slug)?.name;
  return { title: `${categoryName(DEFAULT_LOCALE, slug, dbName)} — SPORT LINER` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "all") {
    const products = await getAllProducts();
    return (
      <CategoryLayout
        slug={null}
        title="All products"
        count={products.length}
        view={products}
      />
    );
  }

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);
  return (
    <CategoryLayout
      slug={category.slug}
      title={category.name}
      count={products.length}
      view={products}
    />
  );
}

function CategoryLayout({
  slug,
  title,
  count,
  view,
}: {
  slug: string | null;
  title: string;
  count: number;
  view: Awaited<ReturnType<typeof getAllProducts>>;
}) {
  return (
    <main className="flex flex-1 flex-col">
      {/* Header is a client component so the category name follows the language switch. */}
      <CatalogHeader slug={slug} fallbackTitle={title} count={count} />
      <CatalogView products={view} />
    </main>
  );
}
