"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { field } from "@/components/auth/AuthCard";
import { newLinkCode, type TgChat } from "@/lib/telegram-chats";

type Status = {
  tokenSaved: boolean;
  reachable: boolean;
  connected: boolean;
  bot: string | null;
  chats: TgChat[];
  relay: string;
  relayFromEnv: boolean;
  includeContacts: boolean;
};

type Failure = { error?: string; code?: string };
type Linking = { code: string; url: string; startedAt: number; forOther: boolean };

const LINK_POLL_MS = 3000;
const LINK_WAIT_MS = 10 * 60 * 1000;

/**
 * Connect the store's Telegram bot: token (+ relay), then recipients added one
 * by one through a one-time t.me/<bot>?start=<code> link.
 */
export function TelegramConnect() {
  const t = useTranslation();
  const [status, setStatus] = useState<Status | null>(null);
  const [token, setToken] = useState("");
  const [relay, setRelay] = useState("");
  const [relayOpen, setRelayOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Failure | null>(null);
  const [linking, setLinking] = useState<Linking | null>(null);
  const [linked, setLinked] = useState<string | null>(null);
  const [linkTimedOut, setLinkTimedOut] = useState(false);
  const [testResult, setTestResult] = useState<{ sent: number; total: number } | null>(null);

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

  // While a link is open, ask the server every few seconds whether Start was pressed.
  useEffect(() => {
    if (!linking) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const res = await fetch("/api/admin/telegram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: linking.code }),
      }).catch(() => null);
      const json = (await res?.json().catch(() => null)) as
        | { linked?: boolean; chat?: TgChat; chats?: TgChat[] }
        | null;
      if (stopped) return;
      if (json?.linked && json.chat && json.chats) {
        const chats = json.chats;
        setLinking(null);
        setLinked(json.chat.title);
        setStatus((s) => (s ? { ...s, chats, connected: chats.length > 0 } : s));
        return;
      }
      if (Date.now() - linking.startedAt > LINK_WAIT_MS) {
        setLinking(null);
        setLinkTimedOut(true);
        return;
      }
      timer = setTimeout(tick, LINK_POLL_MS);
    };
    timer = setTimeout(tick, LINK_POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [linking]);

  async function call(method: "POST" | "PATCH" | "DELETE", body?: unknown, query = "") {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/telegram${query}`, {
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

  /** `share`: a link for a manager — copied, not opened on this device. */
  function openLink(kind: "start" | "startgroup", share = false) {
    if (!status?.bot) return;
    const code = newLinkCode();
    const url = `https://t.me/${status.bot}?${kind}=${code}`;
    setLinked(null);
    setLinkTimedOut(false);
    setError(null);
    setLinking({ code, url, startedAt: Date.now(), forOther: share });
    if (share) navigator.clipboard?.writeText(url).catch(() => null);
    else window.open(url, "_blank", "noopener");
  }

  async function sendTest() {
    setBusy(true);
    setError(null);
    setTestResult(null);
    const res = await fetch("/api/admin/telegram/test", { method: "POST" }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as ({ sent: number; total: number } & Failure) | null;
    setBusy(false);
    if (!res?.ok || !json) {
      setError({ error: json?.error ?? t("admin.errGeneric") });
      return;
    }
    setTestResult({ sent: json.sent, total: json.total });
  }

  const saved = Boolean(status?.tokenSaved);
  const ready = saved && Boolean(status?.reachable);

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
              <ul className="mt-2 space-y-1">
                {status!.chats.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3">
                    <span>• {c.title}</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => call("DELETE", undefined, `?chat=${encodeURIComponent(c.id)}`)}
                      className="text-xs font-semibold text-ink-soft underline disabled:opacity-50"
                    >
                      {t("admin.tgRemove")}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={busy}
                onClick={sendTest}
                className="mt-3 text-xs font-semibold underline disabled:opacity-50"
              >
                {t("admin.tgTest")}
              </button>
              {testResult && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    testResult.sent === testResult.total ? "text-green-800" : "text-amber-800"
                  }`}
                >
                  {t("admin.tgTestDone", { sent: String(testResult.sent), total: String(testResult.total) })}
                </p>
              )}
            </>
          ) : (
            <p className="text-amber-800">{t("admin.tgNoChats", { bot: status!.bot ?? "" })}</p>
          )}
        </div>
      )}

      {ready && (
        <div className="space-y-3 rounded-xl border border-stone p-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openLink("start")}
              className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
            >
              {t("admin.tgOpenBot")}
            </button>
            <button
              type="button"
              onClick={() => openLink("start", true)}
              className="rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
            >
              {t("admin.tgShareLink")}
            </button>
            <button
              type="button"
              onClick={() => openLink("startgroup")}
              className="rounded-full border border-stone px-6 py-3 text-sm font-bold uppercase"
            >
              {t("admin.tgOpenGroup")}
            </button>
          </div>
          {linking && (
            <p className="text-sm text-ink-soft">
              {t(linking.forOther ? "admin.tgWaitingShare" : "admin.tgWaiting")}{" "}
              <a href={linking.url} target="_blank" rel="noopener noreferrer" className="break-all underline">
                {linking.url}
              </a>
            </p>
          )}
          {linked && <p className="text-sm font-semibold text-green-800">{t("admin.tgLinked", { name: linked })}</p>}
          {linkTimedOut && <p className="text-sm text-amber-800">{t("admin.tgLinkTimeout")}</p>}
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
          className="rounded-full border border-ink px-6 py-3 text-sm font-bold uppercase disabled:opacity-50"
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
