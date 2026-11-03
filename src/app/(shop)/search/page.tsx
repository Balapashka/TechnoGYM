import type { Metadata } from "next";
import { getAllProducts } from "@/lib/catalog";
import { searchProducts } from "@/lib/search";
import { ProductCard } from "@/components/shop/ProductCard";
import { SearchHeader } from "@/components/shop/SearchHeader";

export const metadata: Metadata = {
  title: "Поиск — SPORT LINER",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").slice(0, 100).trim();
  const results = q ? searchProducts(await getAllProducts(), q) : [];

  return (
    <main className="container-page flex-1 py-10">
      <SearchHeader q={q} count={results.length} />
      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
