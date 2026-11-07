"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useTranslation } from "@/i18n/useTranslation";

const ease = [0.16, 1, 0.3, 1] as const;

/** Hero copy: brands eyebrow, wide headline, two calls to action. */
export function HeroIntro() {
  const t = useTranslation();

  return (
    <div className="container-page relative z-10 pb-14 pt-32 md:pb-20">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
      >
        {t("home.heroEyebrow")}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.08 }}
        className="max-w-4xl text-4xl font-semibold uppercase leading-[1.05] md:text-6xl lg:text-7xl"
      >
        {t("home.heroTitle")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.16 }}
        className="mt-5 max-w-xl text-base text-white/80 md:text-lg"
      >
        {t("home.heroLead")}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.24 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <Link
          href="/category/all"
          className="hover-lift inline-flex rounded-full bg-paper px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink"
        >
          {t("home.heroCatalog")}
        </Link>
        <Link
          href="/business"
          className="inline-flex rounded-full border border-white/70 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper transition hover:bg-white/10"
        >
          {t("home.heroBusiness")}
        </Link>
      </motion.div>
    </div>
  );
}
