"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { field, fieldError } from "@/components/auth/AuthCard";
import { changePasswordSchema } from "@/schemas/auth";

/** «Сменить пароль» on the account page — e.g. after a temporary admin password. */
export function ChangePasswordForm() {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ current: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("admin.errGeneric"));
      return;
    }
    setBusy(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);
    if (!res?.ok) {
      setError(json?.error ?? t("admin.errGeneric"));
      return;
    }
    setValues({ current: "", password: "", confirm: "" });
    setDone(true);
  }

  if (!open) {
    return (
      <div className="mt-10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-ink px-5 py-2.5 text-xs font-bold uppercase"
        >
          {t("account.changePassword")}
        </button>
        {done && <p className="mt-2 text-sm font-semibold text-green-800">{t("account.passwordChanged")}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 max-w-md space-y-4 rounded-2xl border border-stone p-5">
      <h2 className="text-lg font-black uppercase">{t("account.changePassword")}</h2>
      {(
        [
          ["current", "account.currentPassword", "current-password"],
          ["password", "account.newPassword", "new-password"],
          ["confirm", "account.repeatPassword", "new-password"],
        ] as const
      ).map(([k, label, ac]) => (
        <div key={k}>
          <label htmlFor={`pw-${k}`} className="mb-1 block text-xs font-bold uppercase">
            {t(label)}
          </label>
          <input
            id={`pw-${k}`}
            type="password"
            className={field}
            autoComplete={ac}
            value={values[k]}
            onChange={set(k)}
          />
        </div>
      ))}
      {error && <p className={fieldError}>{error}</p>}
      {done && <p className="text-sm font-semibold text-green-800">{t("account.passwordChanged")}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
        >
          {busy ? t("common.loading") : t("account.savePassword")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
        >
          {t("account.cancel")}
        </button>
      </div>
    </form>
  );
}
