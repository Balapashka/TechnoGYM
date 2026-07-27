import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { CartButton } from "./CartButton";
import { UserMenu } from "./UserMenu";
import { PrimaryNav, BusinessLink } from "./PrimaryNav";
import { MobileMenu } from "./MobileMenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getCurrentUser } from "@/lib/auth";

/**
 * Sticky top header. Below `lg` it collapses to burger — centered logo — cart
 * (language and account actions move into the mobile drawer); from `lg` up it
 * is logo + mega-menu/nav on the left and account/cart actions on the right.
 */
export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-stone bg-paper/95 backdrop-blur">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:flex lg:justify-between lg:gap-6">
        <div className="flex items-center justify-start gap-3 lg:gap-6 xl:gap-8">
          <MobileMenu user={user} />
          <div className="hidden lg:block">
            <Logo />
          </div>
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
            <MegaMenu />
            <PrimaryNav />
          </nav>
        </div>

        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="flex items-center justify-end gap-3 text-sm font-semibold xl:gap-5">
          <BusinessLink />
          <LocaleSwitcher />
          <UserMenu user={user} />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
