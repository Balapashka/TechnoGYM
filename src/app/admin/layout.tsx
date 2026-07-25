import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

/** Guards the whole /admin area to ADMIN users and adds the section nav. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/account");

  return (
    <div className="container-page flex-1 py-10">
      <AdminHeader />
      {children}
    </div>
  );
}
