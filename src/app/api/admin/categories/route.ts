import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categorySchema } from "@/schemas/product";

/** POST /api/admin/categories — create a category (admin only). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid category data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const exists = await prisma.category.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (exists) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 409 },
    );
  }

  const created = await prisma.category.create({
    data: { name: parsed.data.name, slug: parsed.data.slug },
    select: { id: true, slug: true },
  });

  return NextResponse.json(created, { status: 201 });
}
