"use client";

import { motion } from "motion/react";

const WORDS = [
  "Treadmills",
  "Indoor Bikes",
  "Rowers",
  "Strength",
  "Recovery",
  "Free Weights",
  "Ellipticals",
  "Apparel",
  "Nutrition",
];

/** Infinite scrolling keyword band — a continuous "moving system" accent. */
export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="overflow-hidden border-y border-ink bg-accent py-4">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {row.map((w, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-2xl font-black uppercase tracking-tight text-ink"
          >
            {w}
            <span className="text-ink/40">●</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
