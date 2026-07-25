"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Shared input styles for all auth forms. */
export const field =
  "w-full rounded-lg border border-stone px-3 py-2 text-sm transition focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent/40";
export const fieldError = "mt-1 text-xs text-red-600";

/** Centered, animated card shell shared by login/register/reset screens. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page flex flex-1 items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-2xl border border-stone bg-paper p-8 shadow-xl"
      >
        <h1 className="text-2xl font-black uppercase">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </motion.div>
    </div>
  );
}
