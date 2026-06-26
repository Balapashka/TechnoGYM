import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];

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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
            Admin
          </p>
          <h1 className="text-3xl font-black uppercase">Store management</h1>
        </div>
        <nav className="flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="hover-lift rounded-full border border-stone px-4 py-2 text-xs font-bold uppercase hover:bg-mist"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
