import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/catalog";
import { unpackList } from "@/lib/json";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHeading } from "@/components/admin/AdminHeading";

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
      <AdminHeading tKey="admin.editProduct" vars={{ name: product.name }} />
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceRub: product.priceCents / 100,
          brand: product.brand,
          originCountry: product.originCountry,
          categoryId: product.categoryId,
          badge: product.badge ?? "",
          features: unpackList(product.features).join("\n"),
          inStock: product.inStock,
        }}
      />
    </div>
  );
}
