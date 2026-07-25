"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * App-wide page transition. `template.tsx` remounts on every navigation,
 * so each route fades + lifts in. Wraps the page content between header/footer.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
