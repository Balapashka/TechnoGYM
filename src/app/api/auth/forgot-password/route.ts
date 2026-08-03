import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/schemas/auth";

/**
 * Whether to return the reset token in the response body.
 *
 * There is no mail server, so the demo shows the token on screen instead. That
 * also means anyone who knows an email address could reset that account, so it
 * is opt-in: set `DEMO_EXPOSE_RESET_TOKEN=true` for a local demo and leave it
 * unset on any public deployment.
 */
const exposeToken = process.env.DEMO_EXPOSE_RESET_TOKEN === "true";

/**
 * POST /api/auth/forgot-password — issue a reset token.
 * The token is only echoed back when the demo flag above is enabled.
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

  // ...but for a local demo we surface the token so it can be used offline.
  if (!exposeToken) {
    return NextResponse.json({
      ok: true,
      token: null,
      message: "Если такой email зарегистрирован, код для сброса создан.",
    });
  }

  return NextResponse.json({
    ok: true,
    token,
    message: "Код сброса создан (в демоверсии он показан здесь вместо письма).",
  });
}
