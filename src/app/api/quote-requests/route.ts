import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteRequestSchema } from "@/schemas/quote";
import { limitRequest } from "@/lib/rate-limit";
import { notifyNewLead } from "@/lib/notify";

/**
 * POST /api/quote-requests — stores a lead: a "price on request" enquiry from
 * a product page, or a message from the business / contact forms. The manager
 * is notified (Telegram / email) after the response is sent.
 */
export async function POST(request: Request) {
  const limited = limitRequest(request, "lead", 8, 60 * 60_000);
  if (limited) return limited;

  const json = await request.json().catch(() => null);
  const parsed = quoteRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid quote request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { productId, productName, name, phone, email, comment, source, website } =
    parsed.data;

  // Honeypot filled in → a bot. Answer like a success so it does not retry.
  if (website) return NextResponse.json({ ok: true });

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
      source,
      name,
      phone,
      email: email ?? null,
      comment: comment ?? null,
      status: "NEW",
    },
  });

  after(() =>
    notifyNewLead({
      source,
      productName,
      name,
      phone,
      email: email ?? null,
      comment: comment ?? null,
    }),
  );

  return NextResponse.json({ ok: true });
}
