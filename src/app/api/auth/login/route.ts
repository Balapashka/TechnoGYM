import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/login";
import { createSession } from "@/lib/auth";
import { limitRequest } from "@/lib/rate-limit";

/**
 * Hash compared when the email is unknown, so a miss takes as long as a wrong
 * password and response timing does not reveal which emails are registered.
 */
const DUMMY_HASH = "$2b$10$yCe65H/zZ/U8ottdXYrx6.Qw4HSn/uLaUfIcNfNheSpAIec/10eRK";

/** POST /api/auth/login — verify credentials and start a session. */
export async function POST(request: Request) {
  // 10 attempts per 15 minutes per IP: enough for a typo-prone human, useless
  // for password guessing.
  const limited = limitRequest(request, "login", 10, 15 * 60_000);
  if (limited) return limited;

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

  const ok = await bcrypt.compare(
    parsed.data.password,
    user?.password ?? DUMMY_HASH,
  );
  if (!user || !ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
