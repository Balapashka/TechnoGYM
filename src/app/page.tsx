import { Hero } from "@/components/home/Hero";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Marquee } from "@/components/home/Marquee";
import { CollectionsBanner } from "@/components/home/CollectionsBanner";
import { getFeaturedProducts, getCategories } from "@/lib/catalog";

// Storefront data comes from the DB at request time (not prerendered at build).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Marquee />
      <ProductCarousel titleKey="common.featuredProducts" products={featured} />

      {/* Cross-link banner into the tiled collections page */}
      <CollectionsBanner count={categories.length} />

      <CategoryGrid categories={categories} />
    </main>
  );
}
