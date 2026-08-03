"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Set from an effect, so it is only ever `true` in the browser: the server
 * renders this module once per process and never runs effects, which keeps SSR
 * on the "no enter animation" branch no matter how many requests it serves.
 * It survives the remount the App Router forces on every navigation (a
 * `template.tsx` gets a fresh key per route), which is exactly what lets us
 * tell "first paint of the session" apart from "navigated here".
 */
let hasMountedOnce = false;

/**
 * App-wide page transition. `template.tsx` remounts on every navigation, so
 * each route fades in. Wraps the page content between header/footer — and,
 * per the template.js contract, it also wraps `loading.tsx`, so on a navigation
 * this fade plays on the skeleton and the real content then swaps in with no
 * further delay.
 *
 * Two deliberate constraints, both about perceived speed:
 *
 * 1. 0.18s, opacity only. The transition starts only once the content is
 *    already there, so every millisecond of it is added latency the user reads
 *    as "the site is thinking". ~0.18s is around the shortest fade that still
 *    registers as a transition rather than a flicker; the old 0.4s + 12px lift
 *    meant a third of a second of text visibly sliding into place after the
 *    data had arrived. No `y` offset any more: a transform on a wrapper holding
 *    up to ~180 product cards promotes the whole page to a compositor layer,
 *    and the text "arriving" is precisely what felt sluggish.
 *
 * 2. The very first render of a session does not animate at all
 *    (`initial={false}`). Motion serialises `initial` into the SSR markup, so
 *    `initial={{ opacity: 0 }}` would ship every page as `opacity: 0` and leave
 *    the screen blank until the JS bundle downloaded and hydrated — on the
 *    1.2 MB catalog page that is the "screen freezes" symptom itself. Skipping
 *    it means the server HTML paints immediately; client-side navigations,
 *    which need no hydration to become visible, still get the fade.
 *
 * prefers-reduced-motion is handled globally by MotionProvider
 * (`MotionConfig reducedMotion="user"`), which drops transform/layout
 * animations. A 0.18s opacity fade involves no movement, so it is safe to keep
 * for those users, and it is one-shot — nothing here loops.
 */
export default function Template({ children }: { children: ReactNode }) {
  // Read (never write) the flag during render so the hydration pass agrees
  // with the server, which always sees `false`.
  const [animateIn] = useState(() => hasMountedOnce);

  useEffect(() => {
    hasMountedOnce = true;
  }, []);

  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={animateIn ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
