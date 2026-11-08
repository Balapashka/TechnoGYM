import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { forbidUnlessAdmin, getCurrentUser } from "@/lib/auth";
import { emailField } from "@/schemas/auth";
import { adminRemovalError, generateTempPassword } from "@/lib/team";

async function listAdmins() {
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

/** GET — the admin team. */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  return NextResponse.json({ admins: await listAdmins() });
}

const addSchema = z.object({
  email: emailField,
  name: z.string().trim().max(100).optional(),
});

/**
 * POST { email, name? } — make someone an admin. An existing account (the
 * person registered on the site) is promoted and keeps its password; a new
 * one is created with a temporary password, returned once to pass on.
 */
export async function POST(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const parsed = addSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Неверные данные" }, { status: 400 });
  }
  const { email, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing?.role === "ADMIN") {
    return NextResponse.json({ error: "Этот человек уже администратор" }, { status: 409 });
  }
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    return NextResponse.json({ status: "promoted", email, admins: await listAdmins() });
  }

  const tempPassword = generateTempPassword();
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      password: await bcrypt.hash(tempPassword, 10),
      role: "ADMIN",
    },
  });
  return NextResponse.json({ status: "created", email, tempPassword, admins: await listAdmins() });
}

/** DELETE ?id=<userId> — take admin rights away (the account stays as a customer). */
export async function DELETE(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const me = await getCurrentUser();
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const [target, adminCount] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: { id: true, role: true } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);
  const error = adminRemovalError({
    targetId: id,
    currentUserId: me?.id ?? "",
    targetIsAdmin: target?.role === "ADMIN",
    adminCount,
  });
  if (error) return NextResponse.json({ error }, { status: 400 });

  await prisma.user.update({ where: { id }, data: { role: "USER" } });
  // Close their open sessions: the next request needs a fresh login.
  await prisma.session.deleteMany({ where: { userId: id } });
  return NextResponse.json({ admins: await listAdmins() });
}
