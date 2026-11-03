"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { CATALOG_COLUMNS } from "@/lib/csv";

type Summary = { created: number; updated: number; deleted: number; dryRun: boolean };

/** Catalog CSV export + import with a dry-run check before applying. */
export function CatalogImport({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const t = useTranslation();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleteMissing, setDeleteMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function send(dryRun: boolean) {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setErrors([]);
    setSummary(null);
    const body = new FormData();
    body.append("file", file);
    if (deleteMissing) body.append("deleteMissing", "1");
    if (dryRun) body.append("dryRun", "1");
    const res = await fetch("/api/admin/catalog/import", { method: "POST", body }).catch(
      () => null,
    );
    setBusy(false);
    const json = (await res?.json().catch(() => null)) as
      | (Summary & { errors?: string[] })
      | null;
    if (!res?.ok || !json || json.errors) {
      setErrors(json?.errors ?? [t("admin.errGeneric")]);
      return;
    }
    setSummary(json);
    if (!dryRun) router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-black uppercase">{t("admin.import")}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t("admin.importLead")}</p>
        <a
          href="/api/admin/catalog/export"
          download
          className="hover-lift mt-4 inline-block rounded-full border border-ink px-5 py-2.5 text-xs font-bold uppercase"
        >
          {t("admin.downloadCatalog")}
        </a>
      </div>

      <section className="rounded-2xl border border-stone p-5">
        <h3 className="mb-3 text-sm font-black uppercase">{t("admin.columnsTitle")}</h3>
        <ul className="space-y-1 text-sm">
          {CATALOG_COLUMNS.map((c) => (
            <li key={c}>
              <code className="rounded bg-mist px-1.5 py-0.5 text-xs font-bold">{c}</code>{" "}
              <span className="text-ink-soft">— {t(`admin.col_${c}`)}</span>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 mt-5 text-sm font-black uppercase">{t("admin.categorySlugs")}</h3>
        <ul className="flex flex-wrap gap-2 text-xs">
          {categories.map((c) => (
            <li key={c.slug} className="rounded-full border border-stone px-3 py-1">
              <code className="font-bold">{c.slug}</code> — {c.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase">{t("admin.chooseFile")}</span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={() => {
              setSummary(null);
              setErrors([]);
            }}
            className="block w-full text-sm"
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={deleteMissing}
            onChange={(e) => setDeleteMissing(e.target.checked)}
            className="mt-0.5 accent-ink"
          />
          {t("admin.deleteMissing")}
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => send(true)}
            className="hover-lift rounded-full border border-ink px-6 py-3 text-sm font-bold uppercase disabled:opacity-50"
          >
            {t("admin.checkFile")}
          </button>
          <button
            type="button"
            disabled={busy || !summary?.dryRun}
            onClick={() => send(false)}
            className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink disabled:opacity-40"
          >
            {busy ? t("admin.saving") : t("admin.applyImport")}
          </button>
        </div>

        {summary && (
          <p className={summary.dryRun ? "text-sm" : "text-sm font-bold text-green-700"}>
            {t(summary.dryRun ? "admin.importPreview" : "admin.importDone", {
              created: summary.created,
              updated: summary.updated,
              deleted: summary.deleted,
            })}
          </p>
        )}
        {errors.length > 0 && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <p className="font-bold">{t("admin.importErrors")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
