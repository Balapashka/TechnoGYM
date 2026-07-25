import { NextResponse } from "next/server";
import { getAllProducts, getProductsByCategory } from "@/lib/catalog";

/** GET /api/products?category=slug — returns the catalog as JSON. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const products =
    category && category !== "all"
      ? await getProductsByCategory(category)
      : await getAllProducts();
  return NextResponse.json({ count: products.length, products });
}
