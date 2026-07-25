"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` during SSR and the hydration render, `true` afterwards.
 *
 * Components that read persisted client state (cart, locale) must render the
 * server markup on the first client pass or React reports a hydration
 * mismatch. useSyncExternalStore gives us that without a setState-in-effect,
 * which the react-hooks lint rules reject.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
