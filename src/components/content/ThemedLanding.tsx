"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { useTranslation } from "@/i18n/useTranslation";

export type Tile = { title: string; text: string };
export type Section = { heading: string; body: string };

export type LandingContent = {
  eyebrow: string;
  title: string;
  tagline: string;
  /** Tailwind gradient classes for the hero band. */
  gradient: string;
  tiles: Tile[];
  sections: Section[];
  ctaLabel: string;
  ctaHref: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

/** Reusable long themed page: hero, horizontal tile rail, alternating blocks. */
export function ThemedLanding({ content }: { content: LandingContent }) {
  const t = useTranslation();

  return (
    <div className="flex-1">
      {/* Hero band */}
      <section className={`relative overflow-hidden ${content.gradient} text-paper`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="container-page relative py-24 md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mb-3 text-xs font-bold uppercase tracking-widest text-accent"
          >
            {content.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.08 }}
            className="max-w-3xl text-4xl font-black uppercase leading-none md:text-7xl"
          >
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.16 }}
            className="mt-5 max-w-xl text-lg text-white/80"
          >
            {content.tagline}
          </motion.p>
        </div>
      </section>

      {/* Horizontal scrolling tile rail — "windows that pop out" sideways */}
      <section className="border-b border-stone py-12">
        <div className="container-page mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-soft">
            {t("landing.whatThisMeans")}
          </h2>
        </div>
        <div className="flex snap-x gap-5 overflow-x-auto px-4 pb-4 md:px-8">
          {content.tiles.map((tile, i) => (
            <motion.article
              key={tile.title}
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="min-w-[18rem] max-w-[18rem] shrink-0 snap-start rounded-2xl border border-stone bg-gradient-to-br from-mist to-paper p-6"
            >
              <span className="text-3xl font-black text-stone">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-black uppercase">{tile.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{tile.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Alternating reveal blocks for length + rhythm */}
      <section className="container-page space-y-16 py-16">
        {content.sections.map((s, i) => (
          <Reveal key={s.heading} direction={i % 2 === 0 ? "left" : "right"}>
            <div
              className={`grid items-center gap-8 md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-stone to-mist" />
              <div>
                <h3 className="text-2xl font-black uppercase md:text-3xl">
                  {s.heading}
                </h3>
                <p className="mt-3 text-ink-soft">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Support / community strip + CTA */}
      <section className="bg-ink py-20 text-paper">
        <div className="container-page text-center">
          <Stagger className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              "landing.supportEveryBody",
              "landing.everyLevelWelcome",
              "landing.trainYourWay",
            ].map((key) => (
              <StaggerItem key={key}>
                <p className="rounded-2xl border border-white/15 px-4 py-8 text-lg font-bold uppercase">
                  {t(key)}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <Link
              href={content.ctaHref}
              className="hover-lift mt-10 inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase text-ink"
            >
              {content.ctaLabel}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
