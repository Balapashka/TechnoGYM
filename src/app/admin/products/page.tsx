import { prisma } from "@/lib/prisma";
import { ProductRow } from "@/components/admin/ProductRow";
import {
  ProductsToolbar,
  ProductsTableHead,
} from "@/components/admin/ProductsTableChrome";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <ProductsToolbar count={products.length} />

      <div className="overflow-hidden rounded-2xl border border-stone">
        <table className="w-full text-left text-sm">
          <ProductsTableHead />
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
