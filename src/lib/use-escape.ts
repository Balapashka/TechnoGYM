"use client";

import { useEffect } from "react";

/** Close an overlay (drawer, modal) with the Escape key while it is open. */
export function useEscapeToClose(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);
}
