"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { field } from "@/components/auth/AuthCard";
import { smtpPresetFor } from "@/lib/smtp-presets";

type Status = {
  connected: boolean;
  user: string | null;
  fromEnv: boolean;
  /** Saved private notification address ("" = use the store email). */
  notifyEmail: string;
  /** Where notifications go right now. */
  notifyTo: string | null;
};

/** Connect the shop's mailbox: notifications to the manager + letters to customers. */
export function MailConnect() {
  const t = useTranslation();
  const [status, setStatus] = useState<Status | null>(null);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [host, setHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testTo, setTestTo] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySaved, setNotifySaved] = useState(false);

  function apply(s: Status) {
    setStatus(s);
    setNotifyEmail(s.notifyEmail ?? "");
  }

  useEffect(() => {
    fetch("/api/admin/mail")
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Status | null) => s && apply(s))
      .catch(() => null);
  }, []);

  async function saveNotify() {
    setBusy(true);
    setError(null);
    setNotifySaved(false);
    const res = await fetch("/api/admin/mail", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyEmail: notifyEmail.trim() }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as (Status & { error?: string }) | null;
    setBusy(false);
    if (!res?.ok || !json) {
      setError(json?.error ?? t("admin.errGeneric"));
      return;
    }
    apply(json);
    setNotifySaved(true);
  }

  const customDomain = user.includes("@") && user.split("@")[1].includes(".") && !smtpPresetFor(user);

  async function call(method: "POST" | "DELETE") {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/mail", {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify({ user, pass, host: host || undefined }) : undefined,
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as (Status & { error?: string }) | null;
    setBusy(false);
    if (!res?.ok || !json) {
      setError(json?.error ?? t("admin.errGeneric"));
      return;
    }
    setPass("");
    apply(json);
  }

  async function sendTest() {
    setBusy(true);
    setError(null);
    setTestTo(null);
    const res = await fetch("/api/admin/mail/test", { method: "POST" }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { to?: string; error?: string } | null;
    setBusy(false);
    if (!res?.ok || !json?.to) {
      setError(json?.error ?? t("admin.errGeneric"));
      return;
    }
    setTestTo(json.to);
  }

  return (
    <section className="max-w-3xl space-y-4 rounded-2xl border border-stone p-5">
      <div>
        <h3 className="text-sm font-black uppercase">{t("admin.mailTitle")}</h3>
        <p className="mt-1 text-sm text-ink-soft">{t("admin.mailLead")}</p>
      </div>

      {status?.connected && (
        <div className="rounded-xl bg-mist p-4 text-sm">
          <p className="font-semibold text-green-800">
            {t("admin.mailConnected", { email: status.user ?? "" })}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={sendTest}
            className="mt-2 text-xs font-semibold underline disabled:opacity-50"
          >
            {t("admin.mailTest")}
          </button>
          {testTo && (
            <p className="mt-1 text-xs font-semibold text-green-800">
              {t("admin.mailTestDone", { email: testTo })}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="mail-notify" className="mb-1 block text-xs font-bold uppercase">
          {t("admin.mailNotifyTo")}
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="mail-notify"
            type="email"
            className={`${field} min-w-0 flex-1`}
            value={notifyEmail}
            autoComplete="off"
            placeholder={status?.notifyTo ?? "you@yandex.ru"}
            onChange={(e) => {
              setNotifyEmail(e.target.value);
              setNotifySaved(false);
            }}
          />
          <button
            type="button"
            disabled={busy || notifyEmail.trim() === (status?.notifyEmail ?? "")}
            onClick={saveNotify}
            className="rounded-full border border-ink px-5 py-2.5 text-xs font-bold uppercase disabled:opacity-40"
          >
            {t("admin.mailNotifySave")}
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          {status?.notifyTo
            ? t("admin.mailNotifyNow", { email: status.notifyTo })
            : t("admin.mailNotifyHint")}
          {notifySaved && <span className="ml-2 font-semibold text-green-800">{t("admin.mailNotifySaved")}</span>}
        </p>
      </div>

      {status?.fromEnv ? (
        <p className="text-sm text-ink-soft">{t("admin.mailFromEnv")}</p>
      ) : (
        <>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            <li>{t("admin.mailStep1")}</li>
            <li>{t("admin.mailStep2")}</li>
            <li>{t("admin.mailStep3")}</li>
          </ol>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="mail-user" className="mb-1 block text-xs font-bold uppercase">
                {t("admin.mailUser")}
              </label>
              <input
                id="mail-user"
                type="email"
                className={field}
                value={user}
                autoComplete="off"
                placeholder="sportliner@yandex.ru"
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="mail-pass" className="mb-1 block text-xs font-bold uppercase">
                {t("admin.mailPass")}
              </label>
              <input
                id="mail-pass"
                type="password"
                className={field}
                value={pass}
                autoComplete="new-password"
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            {customDomain && (
              <div className="sm:col-span-2">
                <label htmlFor="mail-host" className="mb-1 block text-xs font-bold uppercase">
                  {t("admin.mailHost")}
                </label>
                <input
                  id="mail-host"
                  className={field}
                  value={host}
                  placeholder="smtp.yandex.ru"
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !user || !pass}
              onClick={() => call("POST")}
              className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
            >
              {busy ? t("common.loading") : t("admin.mailConnect")}
            </button>
            {status?.connected && (
              <button
                type="button"
                disabled={busy}
                onClick={() => call("DELETE")}
                className="rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase disabled:opacity-50"
              >
                {t("admin.tgDisconnect")}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
