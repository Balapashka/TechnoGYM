"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCompareStore, COMPARE_LIMIT } from "@/store/compare-store";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Toast for the "comparison list is full" case. The store bumps `limitNudges`
 * on every rejected add; each bump (re)shows the toast for a few seconds.
 */
export function CompareToast() {
  const nudges = useCompareStore((s) => s.limitNudges);
  const t = useTranslation();
  // The toast is visible while there are nudges newer than the last dismissed
  // one — no setState in the effect body, only in the timeout callback.
  const [dismissed, setDismissed] = useState(0);
  const visible = nudges > dismissed;

  useEffect(() => {
    if (nudges === 0) return;
    const timer = setTimeout(() => setDismissed(nudges), 2500);
    return () => clearTimeout(timer);
  }, [nudges]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 16, x: "-50%" }}
          className="fixed bottom-24 left-1/2 z-50 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-xl"
        >
          {t("compare.limitReached", { limit: COMPARE_LIMIT })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
