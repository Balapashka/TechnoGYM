import { prisma } from "@/lib/prisma";
import { CatalogImport } from "@/components/admin/CatalogImport";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });
  return <CatalogImport categories={categories} />;
}
