"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll } from "motion/react";
import { landings } from "@/lib/landings";

const ease = [0.16, 1, 0.3, 1] as const;
const c = landings.design;

/** Design: graphite "spec sheet" with big horizontal scroll-snap panels. */
export function DesignPage() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: railRef });
  const drag = useRef({ active: false, x: 0, left: 0 });
  const rafRef = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = railRef.current;
    if (!el) return;
    e.preventDefault();
    drag.current = { active: true, x: e.clientX, left: el.scrollLeft };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = railRef.current;
    if (!el || !drag.current.active) return;
    e.preventDefault();
    const target = drag.current.left - (e.clientX - drag.current.x);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const clamped = Math.max(0, Math.min(target, maxScroll));

    const animate = () => {
      const current = el.scrollLeft;
      const diff = clamped - current;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = clamped;
        return;
      }
      el.scrollLeft = current + diff * 0.25;
      rafRef.current = requestAnimationFrame(animate);
    };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  const onPointerUp = () => {
    drag.current.active = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const el = railRef.current;
    if (!el) return;
    el.scrollLeft += e.deltaY;
  };

  const onContextMenu = (e: React.MouseEvent) => e.preventDefault();

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    el.style.touchAction = "none";
  }, []);

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
          {c.eyebrow} — Movigym
        </p>
      </section>

      {/* Horizontal panels — drag with the mouse or scroll */}
      <section
        ref={railRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onContextMenu={onContextMenu}
        className="no-scrollbar flex snap-x gap-6 overflow-x-auto px-4 pb-6 select-none md:px-8"
      >
        {c.tiles.map((t, i) => (
          <motion.article
            key={t.title}
            style={{ pointerEvents: "none" }}
            initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.6, ease }}
            className="flex min-w-[80%] snap-center flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900 p-10 md:min-w-[34rem]"
          >
            <div className="flex items-start justify-between">
              <span className="text-7xl font-black text-zinc-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-widest text-zinc-400">
                Spec
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase">{t.title}</h3>
              <p className="mt-3 text-zinc-400">{t.text}</p>
            </div>
          </motion.article>
        ))}
      </section>

      {/* Themed wave progress indicator tied to the rail's scroll position */}
      <div className="container-page pb-12">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            style={{ scaleX: scrollXProgress }}
            className="wave-track absolute inset-0 origin-left rounded-full"
          />
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
