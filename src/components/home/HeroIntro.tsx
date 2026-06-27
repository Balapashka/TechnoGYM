"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useTranslation } from "@/i18n/useTranslation";

const ease = [0.16, 1, 0.3, 1] as const;

/** Animated hero copy: each line lifts in, then the CTA. */
export function HeroIntro() {
  const t = useTranslation();

  return (
    <div className="container-page relative z-10 pb-16">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-3 text-sm font-bold uppercase tracking-widest text-accent"
      >
        {t("common.newSeason")}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.08 }}
        className="max-w-2xl text-4xl font-black uppercase leading-none tracking-tight md:text-6xl"
      >
        {t("common.yourWorkoutYourStyle")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.16 }}
        className="mt-4 max-w-lg text-white/80"
      >
        {t("common.premiumHomeFitness")}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.24 }}
      >
        <Link
          href="/category/all"
          className="hover-lift mt-6 inline-flex rounded-full bg-accent px-7 py-3 text-sm font-bold uppercase text-ink hover:bg-accent-strong"
        >
          {t("common.shopNow")}
        </Link>
      </motion.div>
    </div>
  );
}
