"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { field } from "@/components/auth/AuthCard";

type Admin = { id: string; email: string; name: string | null };
type Added = { status: "created" | "promoted"; email: string; tempPassword?: string };

/** Admin team: who can manage the shop, add a person, take rights away. */
export function TeamManager({ initial, meId }: { initial: Admin[]; meId: string }) {
  const t = useTranslation();
  const [admins, setAdmins] = useState(initial);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Added | null>(null);
  const [copied, setCopied] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setAdded(null);
    setCopied(false);
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: name || undefined }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as
      | (Added & { admins?: Admin[]; error?: string })
      | null;
    setBusy(false);
    if (!res?.ok || !json?.admins) {
      setError(json?.error ?? t("admin.errGeneric"));
      return;
    }
    setAdmins(json.admins);
    setAdded({ status: json.status, email: json.email, tempPassword: json.tempPassword });
    setEmail("");
    setName("");
  }

  async function remove(a: Admin) {
    if (!confirm(t("admin.teamConfirmRemove", { email: a.email }))) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/team?id=${encodeURIComponent(a.id)}`, { method: "DELETE" }).catch(
      () => null,
    );
    const json = (await res?.json().catch(() => null)) as { admins?: Admin[]; error?: string } | null;
    setBusy(false);
    if (!res?.ok || !json?.admins) {
      setError(json?.error ?? t("admin.errGeneric"));
      return;
    }
    setAdmins(json.admins);
  }

  // Text the owner forwards to the new admin (messenger, email…).
  const handover = (a: Added) =>
    [
      t("admin.teamHandoverLogin", { url: `${window.location.origin}/login` }),
      `Email: ${a.email}`,
      t("admin.teamHandoverPassword", { password: a.tempPassword ?? "" }),
      t("admin.teamHandoverChange"),
    ].join("\n");

  return (
    <div className="max-w-3xl space-y-8">
      <p className="text-sm text-ink-soft">{t("admin.teamLead")}</p>

      <section className="rounded-2xl border border-stone">
        <ul className="divide-y divide-stone">
          {admins.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="break-all font-semibold">{a.email}</p>
                <p className="text-xs text-ink-soft">
                  {a.name || "—"}
                  {a.id === meId && <span className="ml-2 rounded bg-mist px-1.5 py-0.5 font-bold">{t("admin.teamYou")}</span>}
                </p>
              </div>
              {a.id !== meId && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(a)}
                  className="text-xs font-semibold text-ink-soft underline disabled:opacity-50"
                >
                  {t("admin.teamRemove")}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={add} className="space-y-4 rounded-2xl border border-stone p-5">
        <h3 className="text-sm font-black uppercase">{t("admin.teamAddTitle")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="team-email" className="mb-1 block text-xs font-bold uppercase">
              Email
            </label>
            <input
              id="team-email"
              type="email"
              required
              className={field}
              value={email}
              autoComplete="off"
              placeholder="manager@yandex.ru"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="team-name" className="mb-1 block text-xs font-bold uppercase">
              {t("admin.teamName")}
            </label>
            <input
              id="team-name"
              className={field}
              value={name}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-ink-soft">{t("admin.teamAddHint")}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !email}
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
        >
          {busy ? t("common.loading") : t("admin.teamAdd")}
        </button>
      </form>

      {added && (
        <section className="space-y-3 rounded-2xl border border-green-700/40 bg-green-50 p-5 text-sm">
          {added.status === "promoted" ? (
            <p className="font-semibold text-green-900">{t("admin.teamPromoted", { email: added.email })}</p>
          ) : (
            <>
              <p className="font-semibold text-green-900">{t("admin.teamCreated", { email: added.email })}</p>
              <pre className="whitespace-pre-wrap rounded-xl bg-paper p-4 font-mono text-xs">{handover(added)}</pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(handover(added)).then(() => setCopied(true)).catch(() => null);
                }}
                className="rounded-full border border-ink px-5 py-2 text-xs font-bold uppercase"
              >
                {copied ? t("admin.teamCopied") : t("admin.teamCopy")}
              </button>
              <p className="text-xs text-ink-soft">{t("admin.teamOnce")}</p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
