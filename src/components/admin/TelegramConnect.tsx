"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { field } from "@/components/auth/AuthCard";

type Status = { connected: boolean; bot?: string | null; chats: { id: string; title: string }[] };

/** Connect the store's Telegram bot: token + chats that wrote /start. */
export function TelegramConnect() {
  const t = useTranslation();
  const [status, setStatus] = useState<Status | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/telegram")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => s && setStatus(s))
      .catch(() => null);
  }, []);

  async function call(method: "POST" | "DELETE", body?: unknown) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/telegram", {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as (Status & { error?: string }) | null;
    setBusy(false);
    if (!res?.ok) {
      setError(json?.error ?? t("admin.errGeneric"));
      return;
    }
    setToken("");
    setStatus(method === "DELETE" ? { connected: false, chats: [] } : json);
  }

  const hasBot = Boolean(status?.bot);

  return (
    <section className="max-w-3xl space-y-4 rounded-2xl border border-stone p-5">
      <div>
        <h3 className="text-sm font-black uppercase">{t("admin.tgTitle")}</h3>
        <p className="mt-1 text-sm text-ink-soft">{t("admin.tgLead")}</p>
      </div>

      {hasBot && (
        <div className="rounded-xl bg-mist p-4 text-sm">
          {status!.chats.length > 0 ? (
            <>
              <p className="font-semibold text-green-800">
                {t("admin.tgConnectedTo", { bot: status!.bot ?? "" })}
              </p>
              <ul className="mt-1 list-disc pl-5">
                {status!.chats.map((c) => (
                  <li key={c.id}>{c.title}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-amber-800">{t("admin.tgNoChats")}</p>
          )}
        </div>
      )}

      <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-soft">
        <li>{t("admin.tgStep1")}</li>
        <li>{t("admin.tgStep2")}</li>
        <li>{t("admin.tgStep3")}</li>
      </ol>

      <div>
        <label htmlFor="tg-token" className="mb-1 block text-xs font-bold uppercase">
          {t("admin.tgToken")}
        </label>
        <input
          id="tg-token"
          className={`${field} font-mono text-xs`}
          value={token}
          autoComplete="off"
          spellCheck={false}
          placeholder="123456789:AA…"
          onChange={(e) => setToken(e.target.value)}
        />
        {hasBot && <p className="mt-1 text-xs text-ink-soft">{t("admin.tgTokenSaved")}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || (!token && !hasBot)}
          onClick={() => call("POST", token ? { token } : {})}
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
        >
          {busy ? t("common.loading") : token || !hasBot ? t("admin.tgConnect") : t("admin.tgRefresh")}
        </button>
        {hasBot && (
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
    </section>
  );
}
