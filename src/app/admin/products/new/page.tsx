import { getBrands, getCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHeading } from "@/components/admin/AdminHeading";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <AdminHeading tKey="admin.createProduct" />
      <ProductForm
        categories={categories}
        brands={(await getBrands()).map((b) => b.name)}
      />
    </div>
  );
}
