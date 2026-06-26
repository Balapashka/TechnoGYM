import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/catalog";
import { unpackList } from "@/lib/json";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 text-xl font-black uppercase">Edit “{product.name}”</h2>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceEuros: product.priceCents / 100,
          categoryId: product.categoryId,
          badge: product.badge ?? "",
          features: unpackList(product.features).join("\n"),
          inStock: product.inStock,
        }}
      />
    </div>
  );
}
