import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/schemas/auth";

/**
 * POST /api/auth/forgot-password — issue a reset token.
 * Demo only: since there is no mail server, the token is returned in the
 * response so the reset flow can be completed locally.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  // Always respond the same way to avoid leaking which emails exist...
  if (!user) {
    return NextResponse.json({
      ok: true,
      token: null,
      message: "Если такой email зарегистрирован, код для сброса создан.",
    });
  }

  const token = randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1h
    },
  });

  // ...but for the demo we surface the token so it can be used offline.
  return NextResponse.json({
    ok: true,
    token,
    message: "Код сброса создан (в демоверсии он показан здесь вместо письма).",
  });
}
