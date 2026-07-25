"use client";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Client-side pieces of the generic info page. InfoPage itself stays a server
 * component, so the translated bits live here.
 */

/** Fallback body for info pages that ship no sections of their own. */
export function InfoDefaultSections() {
  const t = useTranslation();

  const sections = [
    { heading: t("info.placeholderHeading"), body: t("info.placeholderBody") },
    { heading: t("info.anotherHeading"), body: t("info.anotherBody") },
  ];

  return (
    <>
      {sections.map((s) => (
        <section key={s.heading}>
          <h2 className="mb-2 text-xl font-bold uppercase">{s.heading}</h2>
          <p className="text-ink-soft">{s.body}</p>
        </section>
      ))}
    </>
  );
}

/** Demo disclaimer shown at the bottom of every info page. */
export function InfoDemoNote() {
  const t = useTranslation();

  return (
    <p className="rounded bg-mist p-4 text-sm text-ink-soft">
      {t("info.demoNote")}
    </p>
  );
}
