import { Hero } from "@/components/home/Hero";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BrandShowcase } from "@/components/home/BrandShowcase";
import { BusinessBand } from "@/components/home/BusinessBand";
import { Benefits } from "@/components/home/Benefits";
import { getCategories, getHomeShowcase } from "@/lib/catalog";

// Storefront data comes from the DB at request time (not prerendered at build).
export const dynamic = "force-dynamic";

/**
 * Homepage, structured like a premium manufacturer site: hero → brands →
 * flagships → in-stock range → categories → business → service promises.
 */
export default async function HomePage() {
  const [showcase, categories] = await Promise.all([
    getHomeShowcase(),
    getCategories({ nonEmpty: true }),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <BrandShowcase brands={showcase.brands} />
      <ProductCarousel
        titleKey="home.flagshipsTitle"
        leadKey="home.flagshipsLead"
        viewAllHref="/category/all?country=it"
        products={showcase.flagships}
      />
      <ProductCarousel
        titleKey="home.inStockTitle"
        leadKey="home.inStockLead"
        viewAllHref="/category/all?stock=1"
        products={showcase.inStock}
      />
      <CategoryGrid categories={categories} />
      <BusinessBand />
      <Benefits />
    </main>
  );
}
