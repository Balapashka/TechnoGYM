import Link from "next/link";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { CartButton } from "./CartButton";
import { UserMenu } from "./UserMenu";
import { primaryNav } from "@/lib/nav";
import { getCurrentUser } from "@/lib/auth";

/** Sticky top header: logo, mega-menu + nav, and account/cart actions. */
export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-stone bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            <MegaMenu />
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-underline py-2 text-sm font-semibold uppercase tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5 text-sm font-semibold">
          <Link
            href="/business"
            className="nav-underline hidden uppercase tracking-wide md:inline"
          >
            For business
          </Link>
          <UserMenu user={user} />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
