import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { CartButton } from "./CartButton";
import { UserMenu } from "./UserMenu";
import { PrimaryNav, BusinessLink } from "./PrimaryNav";
import { MobileMenu } from "./MobileMenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getCurrentUser } from "@/lib/auth";

/** Sticky top header: logo, mega-menu + nav, and account/cart actions. */
export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-stone bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-3 lg:gap-6 xl:gap-8">
          <MobileMenu />
          <Logo />
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
            <MegaMenu />
            <PrimaryNav />
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold xl:gap-5">
          <BusinessLink />
          <LocaleSwitcher />
          <UserMenu user={user} />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
