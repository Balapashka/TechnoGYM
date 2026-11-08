import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, getCurrentUser } from "@/lib/auth";
import { limitRequest } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/schemas/auth";

/**
 * POST { current, password, confirm } — change your own password. Every other
 * session of the account is closed (a leaked temporary password stops
 * working everywhere); this browser gets a fresh session.
 */
export async function POST(request: Request) {
  const limited = limitRequest(request, "change-password", 10, 60 * 60_000);
  if (limited) return limited;

  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Неверные данные" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: me.id }, select: { password: true } });
  if (!user || !(await bcrypt.compare(parsed.data.current, user.password))) {
    return NextResponse.json({ error: "Текущий пароль указан неверно" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: me.id },
    data: { password: await bcrypt.hash(parsed.data.password, 10), resetToken: null, resetTokenExpiry: null },
  });
  await prisma.session.deleteMany({ where: { userId: me.id } });
  await createSession(me.id);
  return NextResponse.json({ ok: true });
}
