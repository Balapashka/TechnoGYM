import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES, getTranslation, translations } from "./translations";

// vitest runs from the repo root (see vitest.config.ts).
const SRC = resolve(process.cwd(), "src") + "/";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });
}

/** Every `t("some.key")` / `getTranslation(x, "some.key")` literal in the app. */
function usedKeys(): { key: string; file: string }[] {
  const pattern = /\b(?:t|getTranslation)\(\s*(?:[A-Za-z0-9_.]+\s*,\s*)?["'`]([a-z][A-Za-z0-9_.]*\.[A-Za-z0-9_.]+)["'`]/g;
  return walk(SRC).flatMap((file) => {
    const source = readFileSync(file, "utf8");
    return [...source.matchAll(pattern)].map((m) => ({
      key: m[1],
      file: file.slice(SRC.length),
    }));
  });
}

describe("translation keys referenced by components", () => {
  const keys = usedKeys();

  it("finds translation calls to check", () => {
    expect(keys.length).toBeGreaterThan(50);
  });

  it.each(LOCALES.map((l) => l.code))("all resolve in %s", (locale) => {
    const missing = keys
      .filter(({ key }) => getTranslation(locale, key) === key)
      // A key path is only "missing" if it is not literally the translated text.
      .filter(({ key }) => !key.startsWith("social."))
      .map(({ key, file }) => `${key} (${file})`);

    expect([...new Set(missing)]).toEqual([]);
  });

  it("keeps the dictionaries free of empty strings", () => {
    const empties: string[] = [];
    const walkValues = (value: unknown, path: string) => {
      if (typeof value === "string") {
        if (!value.trim()) empties.push(path);
        return;
      }
      if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) {
          walkValues(v, path ? `${path}.${k}` : k);
        }
      }
    };
    walkValues(translations, "");
    expect(empties).toEqual([]);
  });
});
