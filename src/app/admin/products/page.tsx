import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductRow } from "@/components/admin/ProductRow";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink-soft">{products.length} products</p>
        <Link
          href="/admin/products/new"
          className="hover-lift rounded-full bg-accent px-5 py-2.5 text-xs font-bold uppercase text-ink"
        >
          + New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow
                key={p.id}
                id={p.id}
                name={p.name}
                category={p.category.name}
                priceCents={p.priceCents}
                inStock={p.inStock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
