"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { field } from "@/components/auth/AuthCard";

type Status = {
  tokenSaved: boolean;
  reachable: boolean;
  connected: boolean;
  bot: string | null;
  chats: { id: string; title: string }[];
  relay: string;
  relayFromEnv: boolean;
  includeContacts: boolean;
};

type Failure = { error?: string; code?: string };

/** Connect the store's Telegram bot: token + chats that wrote /start (+ relay). */
export function TelegramConnect() {
  const t = useTranslation();
  const [status, setStatus] = useState<Status | null>(null);
  const [token, setToken] = useState("");
  const [relay, setRelay] = useState("");
  const [relayOpen, setRelayOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Failure | null>(null);

  function apply(s: Status) {
    setStatus(s);
    setRelay(s.relay);
    if (s.relay) setRelayOpen(true);
  }

  useEffect(() => {
    fetch("/api/admin/telegram")
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Status | null) => s && apply(s))
      .catch(() => null);
  }, []);

  async function call(method: "POST" | "PATCH" | "DELETE", body?: unknown) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/telegram", {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as (Status & Failure) | null;
    setBusy(false);
    if (!res?.ok || !json) {
      setError({ error: json?.error ?? t("admin.errGeneric"), code: json?.code });
      if (json?.code === "unreachable" || json?.code === "relay") setRelayOpen(true);
      return;
    }
    setToken("");
    apply(json);
  }

  function connect() {
    const body: { token?: string; relay?: string } = {};
    if (token) body.token = token;
    if (relayOpen && !status?.relayFromEnv) body.relay = relay;
    call("POST", body);
  }

  const saved = Boolean(status?.tokenSaved);

  return (
    <section className="max-w-3xl space-y-4 rounded-2xl border border-stone p-5">
      <div>
        <h3 className="text-sm font-black uppercase">{t("admin.tgTitle")}</h3>
        <p className="mt-1 text-sm text-ink-soft">{t("admin.tgLead")}</p>
      </div>

      {saved && (
        <div className="rounded-xl bg-mist p-4 text-sm">
          {!status!.reachable ? (
            <p className="text-amber-800">{t("admin.tgUnreachable")}</p>
          ) : status!.chats.length > 0 ? (
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
        {saved && <p className="mt-1 text-xs text-ink-soft">{t("admin.tgTokenSaved")}</p>}
      </div>

      {status?.relayFromEnv ? (
        <p className="text-xs text-ink-soft">{t("admin.tgRelayFromEnv")}</p>
      ) : relayOpen ? (
        <div>
          <label htmlFor="tg-relay" className="mb-1 block text-xs font-bold uppercase">
            {t("admin.tgRelay")}
          </label>
          <input
            id="tg-relay"
            className={`${field} font-mono text-xs`}
            value={relay}
            autoComplete="off"
            spellCheck={false}
            placeholder="https://notify.example.ru"
            onChange={(e) => setRelay(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink-soft">{t("admin.tgRelayHint")}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRelayOpen(true)}
          className="text-xs font-semibold text-ink-soft underline"
        >
          {t("admin.tgRelayToggle")}
        </button>
      )}

      {saved && (
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
            checked={status!.includeContacts}
            disabled={busy}
            onChange={(e) => call("PATCH", { includeContacts: e.target.checked })}
          />
          <span>
            <span className="font-semibold">{t("admin.tgContacts")}</span>
            <span className="mt-0.5 block text-xs text-ink-soft">{t("admin.tgContactsHint")}</span>
          </span>
        </label>
      )}

      {error?.error && <p className="text-sm text-red-600">{error.error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || (!token && !saved)}
          onClick={connect}
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-50"
        >
          {busy ? t("common.loading") : token || !saved ? t("admin.tgConnect") : t("admin.tgRefresh")}
        </button>
        {saved && (
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
