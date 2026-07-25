import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/login";
import { createSession } from "@/lib/auth";

/** POST /api/auth/login — verify credentials and start a session. */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid credentials format" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  const ok = user && (await bcrypt.compare(parsed.data.password, user.password));
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  await createSession(user!.id);
  return NextResponse.json({
    id: user!.id,
    name: user!.name,
    email: user!.email,
    role: user!.role,
  });
}
