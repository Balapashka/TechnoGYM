import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetSchema } from "@/schemas/auth";

/** POST /api/auth/reset-password — set a new password using a valid token. */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid reset data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { resetToken: parsed.data.token },
  });
  if (
    !user ||
    !user.resetTokenExpiry ||
    user.resetTokenExpiry < new Date()
  ) {
    return NextResponse.json(
      { error: "This reset token is invalid or has expired" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(parsed.data.password, 10),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ ok: true });
}
