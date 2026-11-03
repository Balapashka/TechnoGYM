"use client";

import { useTranslation } from "@/i18n/useTranslation";

/** Newsletter subscribers + CSV export (for Unisender, SendPulse, …). */
export function SubscribersList({
  rows,
}: {
  rows: { id: string; email: string; createdAtLabel: string }[];
}) {
  const t = useTranslation();
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black uppercase">
          {t("admin.subscribers")} <span className="text-ink-soft">{rows.length}</span>
        </h2>
        {rows.length > 0 && (
          <a
            href="/api/admin/subscribers"
            download
            className="hover-lift rounded-full border border-ink px-5 py-2 text-xs font-bold uppercase"
          >
            {t("admin.exportCsv")}
          </a>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone p-10 text-center">
          <p className="text-ink-soft">{t("admin.noSubscribers")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-stone rounded-2xl border border-stone text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex justify-between gap-4 px-4 py-2.5">
              <span className="break-all">{r.email}</span>
              <span className="whitespace-nowrap text-ink-soft">{r.createdAtLabel}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
