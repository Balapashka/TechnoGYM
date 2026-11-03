import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/schemas/newsletter";
import { limitRequest } from "@/lib/rate-limit";

/** POST /api/subscribe — footer newsletter signup (idempotent per email). */
export async function POST(request: Request) {
  const limited = limitRequest(request, "subscribe", 10, 60 * 60_000);
  if (limited) return limited;

  const json = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });
  return NextResponse.json({ ok: true });
}
