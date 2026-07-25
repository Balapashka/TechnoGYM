import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/schemas/auth";
import { createSession } from "@/lib/auth";

/** POST /api/auth/register — create a USER account and start a session. */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: await bcrypt.hash(parsed.data.password, 10),
      role: "USER",
    },
  });

  await createSession(user.id);
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
