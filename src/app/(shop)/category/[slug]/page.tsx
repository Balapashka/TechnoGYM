import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogShell } from "@/components/shop/CatalogShell";
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
  if (slug === "all") {
    return {
      title: "Каталог тренажёров Technogym и UNIX Fit — купить в Москве | SPORT LINER",
      description:
        "Каталог тренажёров для дома и фитнес-клубов: беговые дорожки, велотренажёры, эллипсы, гребные и силовые тренажёры. UNIX Fit в наличии, Technogym под заказ. Доставка по Москве и России.",
      alternates: { canonical: "/category/all" },
    };
  }

  // Titles are not reactive, so they use the default locale's category name.
  const categories = await getCategories();
  const dbName = categories.find((c) => c.slug === slug)?.name;
  const name = categoryName(DEFAULT_LOCALE, slug, dbName);
  return {
    title: `${name} — купить в Москве, цены | SPORT LINER`,
    description: `${name} Technogym и UNIX Fit для дома и фитнес-клуба: модели в наличии в Москве и под заказ из Италии. Доставка, сборка, гарантия.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "all") {
    const products = await getAllProducts();
    return <CategoryLayout slug={null} title="All products" view={products} />;
  }

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);
  return (
    <CategoryLayout
      slug={category.slug}
      title={category.name}
      view={products}
    />
  );
}

function CategoryLayout({
  slug,
  title,
  view,
}: {
  slug: string | null;
  title: string;
  view: Awaited<ReturnType<typeof getAllProducts>>;
}) {
  return (
    <main className="flex flex-1 flex-col">
      {/* The shell is a client component: it reads the filter state from the
          URL and keeps the header, chips and grid in sync reactively. */}
      <Suspense>
        <CatalogShell slug={slug} fallbackTitle={title} products={view} />
      </Suspense>
    </main>
  );
}
