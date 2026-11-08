import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminHeading } from "@/components/admin/AdminHeading";
import { TeamManager } from "@/components/admin/TeamManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const [me, admins] = await Promise.all([
    getCurrentUser(),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true },
    }),
  ]);
  return (
    <div>
      <AdminHeading tKey="admin.team" />
      <TeamManager initial={admins} meId={me?.id ?? ""} />
    </div>
  );
}
