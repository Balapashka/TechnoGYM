"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { landings } from "@/lib/landings";
import { useTranslation } from "@/i18n/useTranslation";

const ease = [0.16, 1, 0.3, 1] as const;
const c = landings.community;

/** Supportive phrases for the scrolling band, as dictionary keys. */
const PHRASE_KEYS = [
  "landing.youBelongHere",
  "landing.supportEveryBody",
  "landing.noJudgement",
  "landing.everyLevelWelcome",
  "landing.trainYourWay",
];

/** Community: bold spotlight hero, supportive marquee, rotate-in masonry tiles. */
export function CommunityPage() {
  const t = useTranslation();
  const phrases = PHRASE_KEYS.map((key) => t(key));

  return (
    <div className="flex-1">
      <section className={`relative overflow-hidden ${c.gradient} text-paper`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="container-page relative py-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
            transition={{ duration: 0.8, ease }}
            className="mx-auto max-w-4xl text-5xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            {c.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-white/80"
          >
            {c.tagline}
          </motion.p>
        </div>
      </section>

      {/* Supportive phrases marquee */}
      <div className="overflow-hidden border-y border-ink bg-accent py-3">
        <motion.div
          className="flex w-max gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        >
          {/* An even number of copies keeps the -50% loop seamless. */}
          {[...phrases, ...phrases, ...phrases, ...phrases].map((p, i) => (
            <span key={i} className="flex items-center gap-8 text-xl font-black uppercase text-ink">
              {p}
              <span className="text-ink/40">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Rotate-in masonry tiles */}
      <section className="container-page columns-1 gap-5 py-16 sm:columns-2 lg:columns-3">
        {c.tiles.map((tile, i) => (
          <motion.div
            key={tile.title}
            initial={{ opacity: 0, rotate: i % 2 ? 4 : -4, scale: 0.9 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            whileHover={{ y: -6 }}
            className={`mb-5 break-inside-avoid rounded-2xl border border-stone p-6 ${
              i % 3 === 0 ? "bg-ink text-paper" : "bg-mist"
            }`}
          >
            <h3 className="text-2xl font-black uppercase">{tile.title}</h3>
            <p className={`mt-2 text-sm ${i % 3 === 0 ? "text-white/70" : "text-ink-soft"}`}>
              {tile.text}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="bg-ink py-20 text-center text-paper">
        <div className="container-page space-y-10">
          {c.sections.map((s, i) => (
            <motion.div
              key={s.heading}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.05 }}
              className="mx-auto max-w-2xl"
            >
              <h3 className="text-2xl font-black uppercase md:text-3xl">{s.heading}</h3>
              <p className="mt-2 text-white/70">{s.body}</p>
            </motion.div>
          ))}
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
