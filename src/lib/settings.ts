import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  mergeSettings,
  SETTINGS_KEYS,
  type StoreSettings,
} from "@/lib/settings-shape";

/**
 * Current store settings (defaults + what the owner saved in /admin/settings).
 * Memoized per request, so the layout and a page can both call it for free.
 * Never throws: a missing table (fresh database before migrations) degrades to
 * the defaults instead of taking the whole site down.
 */
export const getSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const rows = await prisma.setting.findMany();
    return mergeSettings(rows);
  } catch (e) {
    console.error("[settings] could not read settings:", e);
    return mergeSettings([]);
  }
});

/** Persist every known key in one transaction. */
export async function saveSettings(values: StoreSettings): Promise<void> {
  await prisma.$transaction(
    SETTINGS_KEYS.map((key) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: values[key] },
        create: { key, value: values[key] },
      }),
    ),
  );
}
