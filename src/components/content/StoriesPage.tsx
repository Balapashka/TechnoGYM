"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { landings } from "@/lib/landings";
import { useTranslation } from "@/i18n/useTranslation";

const ease = [0.16, 1, 0.3, 1] as const;
const c = landings.stories;

/** Stories: warm gradient hero + vertical timeline of alternating cards. */
export function StoriesPage() {
  const t = useTranslation();

  return (
    <div className="flex-1">
      <section className={`relative overflow-hidden ${c.gradient} text-paper`}>
        <div className="container-page py-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs font-bold uppercase tracking-widest text-accent"
          >
            {c.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease }}
            className="mx-auto max-w-3xl text-4xl font-black uppercase md:text-6xl"
          >
            {c.title}
          </motion.h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">{c.tagline}</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-page py-20">
        {/*
          Isolated stacking context: the decorative line lives at z-0 inside
          this wrapper only, so it can never cross the text sections or the
          CTA below, and the cards always paint above it.
        */}
        {/* overflow-x-clip: cards animate in from x:±50 and must not create
            a horizontal scrollbar while still below the viewport. */}
        <div className="relative isolate overflow-x-clip">
          <ul className="space-y-12 pl-10 md:pl-0">
            {c.tiles.map((tile, i) => {
              const left = i % 2 === 0;
              const last = i === c.tiles.length - 1;
              return (
                <li
                  key={tile.title}
                  className={`relative md:flex ${left ? "md:justify-start" : "md:justify-end"}`}
                >
                  {/* Line segment from this card's marker to the next one's,
                      so the line starts at the first dot and ends at the last. */}
                  {!last && (
                    <motion.span
                      aria-hidden="true"
                      // Centering lives in motion's own transform (x), because
                      // motion overwrites the transform Tailwind classes set.
                      style={{ x: "-50%" }}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease }}
                      className="pointer-events-none absolute bottom-[-4.875rem] left-[-1.5rem] top-[1.875rem] z-0 w-px origin-top bg-stone md:left-1/2"
                    />
                  )}
                  {/* Marker, bound to its card's row (the li), on the line. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-[-1.5rem] top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-paper md:left-1/2"
                  />
                  <motion.div
                    initial={{ opacity: 0, x: left ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.55, ease }}
                    className="relative z-10 md:w-[45%]"
                  >
                    <div className="rounded-2xl border border-stone bg-paper p-6 shadow-sm">
                      <span className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                        {t("landing.story", {
                          number: String(i + 1).padStart(2, "0"),
                        })}
                      </span>
                      <h3 className="mt-1 text-xl font-black uppercase">{tile.title}</h3>
                      <p className="mt-2 text-sm text-ink-soft">{tile.text}</p>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-16 space-y-10">
          {c.sections.map((s) => (
            <motion.div
              key={s.heading}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="mx-auto max-w-2xl text-center"
            >
              <h3 className="text-2xl font-black uppercase">{s.heading}</h3>
              <p className="mt-2 text-ink-soft">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={c.ctaHref}
            className="hover-lift inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase text-ink"
          >
            {c.ctaLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
