import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import https from "node:https";
import tls from "node:tls";
import { forbidUnlessAdmin } from "@/lib/auth";
import { DEFAULT_API_BASE, getTelegramConfig } from "@/lib/telegram-config";

export const dynamic = "force-dynamic";

const STEP_TIMEOUT_MS = 5000;
const ROUNDS = 6;

type Step = { ms: number; ok: boolean; note?: string };

async function timed(fn: () => Promise<string | void>): Promise<Step> {
  const t0 = performance.now();
  try {
    const note = await fn();
    return { ms: Math.round(performance.now() - t0), ok: true, ...(note ? { note } : {}) };
  } catch (e) {
    return { ms: Math.round(performance.now() - t0), ok: false, note: e instanceof Error ? e.message : String(e) };
  }
}

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), STEP_TIMEOUT_MS)),
  ]);
}

/** GET over a brand-new connection (DNS + TCP + TLS + request), like a first notification after a pause. */
function freshGet(url: string): Promise<string> {
  return withTimeout(
    new Promise<string>((resolve, reject) => {
      const req = https.get(url, { agent: false }, (res) => {
        res.resume();
        res.on("end", () => resolve(`HTTP ${res.statusCode}`));
      });
      req.on("error", reject);
    }),
  );
}

function tlsHandshake(address: string, servername: string): Promise<void> {
  return withTimeout(
    new Promise<void>((resolve, reject) => {
      const socket = tls.connect({ host: address, port: 443, servername }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", reject);
    }),
  );
}

/**
 * GET — where does the road to Telegram stall? Times each leg several times
 * over fresh connections: DNS, TLS to the relay, the relay's /health (no
 * Telegram involved) and getMe (relay → Telegram). Admin only.
 */
export async function GET() {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;
  const cfg = await getTelegramConfig();
  if (!cfg) return NextResponse.json({ error: "Бот не подключён" }, { status: 400 });
  const base = cfg.apiBase || DEFAULT_API_BASE;
  const host = new URL(base).hostname;

  const rounds = [];
  for (let i = 0; i < ROUNDS; i++) {
    let address = "";
    const dns = await timed(async () => {
      address = (await withTimeout(lookup(host, { family: 4 }))).address;
      return address;
    });
    const handshake = address ? await timed(() => tlsHandshake(address, host)) : null;
    const health = cfg.apiBase ? await timed(() => freshGet(`${base}/health`)) : null;
    const getMe = await timed(() => freshGet(`${base}/bot${cfg.token}/getMe`));
    rounds.push({ dns, tls: handshake, health, getMe });
    await new Promise((r) => setTimeout(r, 500));
  }
  return NextResponse.json({ host, rounds });
}
