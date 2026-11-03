import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { CartButton } from "./CartButton";
import { UserMenu } from "./UserMenu";
import { PrimaryNav } from "./PrimaryNav";
import { MobileMenu } from "./MobileMenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SearchButton } from "./SearchButton";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

/**
 * Sticky top header. Below `lg` it collapses to burger — centered logo — cart
 * (language and account actions move into the mobile drawer); from `lg` up it
 * is logo + mega-menu/nav on the left and account/cart actions on the right.
 */
export async function Header() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  return (
    <header className="sticky top-0 z-30 border-b border-stone bg-paper/95 backdrop-blur">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:flex lg:justify-between lg:gap-6">
        <div className="flex items-center justify-start gap-3 lg:gap-6 xl:gap-8">
          <MobileMenu user={user} phone={settings.phone} />
          <div className="hidden shrink-0 lg:block">
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
          <LocaleSwitcher />
          <UserMenu user={user} />
          <SearchButton />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
