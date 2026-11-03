import "server-only";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Session cookie name. Kept from the project's original internal name so
 * existing sessions stay valid.
 */
export const SESSION_COOKIE = "movigym_session";
const SESSION_DAYS = 7;

/**
 * Mark the session cookie `Secure`. Off by default because local runs are
 * served over plain HTTP (`http://localhost:3000`) and a Secure cookie would
 * not be sent back, breaking login. Set `SESSION_COOKIE_SECURE=true` when the app is
 * served over HTTPS.
 */
const secureCookie = process.env.SESSION_COOKIE_SECURE === "true";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

/** Create a DB session for a user and set the session cookie. Route handlers only. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  // Housekeeping: drop expired sessions so the table does not grow forever.
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await prisma.session.create({ data: { token, userId, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    expires: expiresAt,
  });
}

/** Read the current user from the session cookie. Safe in any server context. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const { id, email, name, role } = session.user;
  return { id, email, name, role };
}

/** Destroy the current session (logout). Route handlers only. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  jar.delete(SESSION_COOKIE);
}

/**
 * Guard for /api/admin/* route handlers: returns a 403 response for anyone
 * but an ADMIN, or null to continue. Every admin route must call it — the
 * /admin layout redirect does not protect the API.
 */
export async function forbidUnlessAdmin(): Promise<Response | null> {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") return null;
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
