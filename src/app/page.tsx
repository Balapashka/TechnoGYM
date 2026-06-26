import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Marquee } from "@/components/home/Marquee";
import { Reveal } from "@/components/motion/Reveal";
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
      <ProductCarousel title="Featured products" products={featured} />

      {/* Cross-link banner into the tiled collections page */}
      <Reveal>
        <section className="container-page py-12">
          <div className="hover-lift group relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-paper md:px-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,237,0,0.25),transparent_55%)]" />
            <div className="relative max-w-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                12 collections
              </p>
              <h2 className="text-3xl font-black uppercase md:text-5xl">
                Find your training space
              </h2>
              <p className="mt-3 text-white/70">
                Browse every category as an interactive tile board, with quick
                view and instant add-to-cart.
              </p>
              <Link
                href="/collections"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold uppercase text-ink"
              >
                Explore collections
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <CategoryGrid categories={categories} />
    </main>
  );
}
