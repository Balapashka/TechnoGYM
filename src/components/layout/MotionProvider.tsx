"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * App-wide motion policy: every motion.* animation respects the OS
 * prefers-reduced-motion setting (transform/layout animations are dropped,
 * content still appears).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
