import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteRequestSchema } from "@/schemas/quote";

/** POST /api/quote-requests — stores a "price on request" lead. */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = quoteRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid quote request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { productId, productName, name, phone, email, comment } = parsed.data;

  // Link the lead to the product only when that row still exists — the catalog
  // may have changed since the page was rendered, and the optional foreign key
  // would otherwise reject the whole request. The name snapshot keeps the lead
  // readable either way.
  const product = productId
    ? await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      })
    : null;

  await prisma.quoteRequest.create({
    data: {
      productId: product?.id ?? null,
      productName,
      name,
      phone,
      email: email ?? null,
      comment: comment ?? null,
      status: "NEW",
    },
  });

  return NextResponse.json({ ok: true });
}
