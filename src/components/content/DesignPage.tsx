"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll } from "motion/react";
import { landings } from "@/lib/landings";
import { useTranslation } from "@/i18n/useTranslation";

const ease = [0.16, 1, 0.3, 1] as const;
const c = landings.design;

/** Design: graphite "spec sheet" with big horizontal scroll-snap panels. */
export function DesignPage() {
  const t = useTranslation();
  const railRef = useRef<HTMLDivElement>(null);
  // MotionValue: the progress bar follows the scroll position off the React
  // render path — no state updates, no re-renders per scrolled pixel.
  const { scrollXProgress } = useScroll({ container: railRef });

  /** Advance the native scroll by one panel; snap does the precise landing. */
  const scrollByPanel = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * el.clientWidth * 0.8,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100">
      {/* Split hero: oversized type left, vertical label right */}
      <section className="container-page grid items-end gap-6 py-24 md:grid-cols-[1fr_auto]">
        <div>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease }}
            className="block h-1 w-24 origin-left bg-accent"
          />
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="mt-6 text-5xl font-black uppercase leading-[0.9] tracking-tight md:text-8xl"
          >
            {c.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 max-w-md text-zinc-400"
          >
            {c.tagline}
          </motion.p>
        </div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 [writing-mode:vertical-rl] md:block">
          {c.eyebrow} — SPORT LINER
        </p>
      </section>

      {/* Horizontal panels — native scroll-snap rail (trackpad, touch, wheel
          tilt, keyboard arrows when focused, or the buttons below). */}
      <section
        ref={railRef}
        tabIndex={0}
        role="region"
        aria-label={c.eyebrow}
        // Arrows page between panels: the native 40px key-step is smaller
        // than a panel, so mandatory snap would roll it back to the same one.
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          scrollByPanel(e.key === "ArrowRight" ? 1 : -1);
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain px-4 pb-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:px-8"
      >
        {c.tiles.map((tile, i) => (
          <motion.article
            key={tile.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.6, ease }}
            className="flex min-w-[80%] snap-center flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900 p-10 md:min-w-[34rem]"
          >
            <div className="flex items-start justify-between">
              <span className="text-7xl font-black text-zinc-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-widest text-zinc-400">
                {t("landing.spec")}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase">{tile.title}</h3>
              <p className="mt-3 text-zinc-400">{tile.text}</p>
            </div>
          </motion.article>
        ))}
      </section>

      {/* Progress indicator tied to the rail's scroll position + arrows */}
      <div className="container-page flex items-center gap-6 pb-12">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            style={{ scaleX: scrollXProgress }}
            className="wave-track absolute inset-0 origin-left rounded-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByPanel(-1)}
            aria-label={t("landing.previous")}
            className="hover-lift grid h-10 w-10 place-items-center rounded-full border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByPanel(1)}
            aria-label={t("landing.next")}
            className="hover-lift grid h-10 w-10 place-items-center rounded-full border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            →
          </button>
        </div>
      </div>

      {/* Spec list with line-by-line reveal */}
      <section className="container-page py-20">
        {c.sections.map((s, i) => (
          <motion.div
            key={s.heading}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease, delay: i * 0.05 }}
            className="flex flex-col gap-4 border-t border-zinc-800 py-8 md:flex-row md:items-baseline md:justify-between"
          >
            <h3 className="text-2xl font-black uppercase md:w-1/3">{s.heading}</h3>
            <p className="text-zinc-400 md:w-1/2">{s.body}</p>
          </motion.div>
        ))}
        <Link
          href={c.ctaHref}
          className="hover-lift mt-10 inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase text-ink"
        >
          {c.ctaLabel}
        </Link>
      </section>
    </div>
  );
}
