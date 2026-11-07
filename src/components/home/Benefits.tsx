"use client";

import { useTranslation } from "@/i18n/useTranslation";

const ICONS = [
  // truck
  "M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 18a1.5 1.5 0 1 0 0 .01M17 18a1.5 1.5 0 1 0 0 .01",
  // shield
  "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z M9 12l2 2 4-4",
  // person/advice
  "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
  // card
  "M3 6h18v12H3zM3 10h18",
];

/** Four service promises under the hero content. */
export function Benefits() {
  const t = useTranslation();
  return (
    <section className="border-y border-stone">
      <ul className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n, i) => (
          <li key={n} className="flex gap-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            >
              <path d={ICONS[i]} />
            </svg>
            <div>
              <p className="font-display text-sm font-semibold uppercase">
                {t(`home.benefit${n}Title`)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{t(`home.benefit${n}Body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
