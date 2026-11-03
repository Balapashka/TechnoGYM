import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/health — liveness + database check for Docker and uptime monitors. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
