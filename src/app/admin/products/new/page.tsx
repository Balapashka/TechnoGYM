import { getCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <h2 className="mb-6 text-xl font-black uppercase">New product</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
