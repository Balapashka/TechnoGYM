"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

/** Long manufacturer descriptions: first paragraphs, then "Read more". */
export function Description({ text }: { text: string }) {
  const t = useTranslation();
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const [open, setOpen] = useState(false);
  const LIMIT = 3;
  const shown = open ? paras : paras.slice(0, LIMIT);
  return (
    <div>
      <div className="space-y-4 text-ink-soft">
        {shown.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
      {paras.length > LIMIT && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-4 border-b border-ink pb-0.5 text-xs font-semibold uppercase tracking-wider"
        >
          {open ? t("product.readLess") : t("product.readMore")}
        </button>
      )}
    </div>
  );
}
