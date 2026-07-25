"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { useTranslation } from "@/i18n/useTranslation";

/** Account actions in the header. Logged-out → Login/Join; logged-in → menu. */
export function UserMenu({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const t = useTranslation();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="hidden items-center gap-4 md:flex">
        <Link href="/login" className="uppercase tracking-wide hover:text-ink-soft">
          {t("common.login")}
        </Link>
        <Link
          href="/register"
          className="hidden rounded-full bg-ink px-4 py-1.5 text-xs uppercase tracking-wide text-paper transition hover:bg-ink-soft md:max-lg:inline-block xl:inline-block"
        >
          {t("common.join")}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 uppercase tracking-wide hover:text-ink-soft"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[11px] font-black text-ink">
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </span>
        <span className="hidden lg:inline">{user.name ?? t("common.account")}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-3 w-52 overflow-hidden rounded-xl border border-stone bg-paper shadow-xl">
            <div className="border-b border-stone px-4 py-3 text-xs text-ink-soft">
              {t("auth.signIn")}
              <div className="truncate font-bold text-ink">{user.email}</div>
            </div>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm hover:bg-mist"
            >
              {t("common.account")}
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-bold text-ink hover:bg-mist"
              >
                {t("account.adminDashboard")}
              </Link>
            )}
            <button
              onClick={logout}
              className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-mist"
            >
              {t("common.logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
