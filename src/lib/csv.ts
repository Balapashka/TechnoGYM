/**
 * CSV for the catalog import/export (/admin/import). Pure functions.
 *
 * Built for Excel with Russian regional settings: it writes ";" as the
 * delimiter with a UTF-8 BOM, and reads either ";" or "," and either UTF-8 or
 * Windows-1251 (what Excel's plain "CSV" format saves on a Russian Windows).
 */
import { conditionCell, parseCondition, type ProductCondition } from "@/lib/condition";

/** Decode file bytes: UTF-8 (with or without BOM), else Windows-1251. */
export function decodeCsvBytes(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  if (!utf8.includes("�")) return utf8.replace(/^﻿/, "");
  return new TextDecoder("windows-1251").decode(bytes);
}

/** The delimiter used by the header line: ";" (Excel RU) or ",". */
export function detectDelimiter(text: string): ";" | "," {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const count = (ch: string) => firstLine.split(ch).length - 1;
  return count(";") >= count(",") ? ";" : ",";
}

/** RFC 4180 parser: quoted fields, "" escapes, newlines inside quotes. */
export function parseCsv(text: string, delimiter = detectDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop blank lines (Excel often appends one).
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function escapeField(value: string, delimiter: string): string {
  return /["\r\n]/.test(value) || value.includes(delimiter)
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

/** Serialize rows for Excel: ";" delimiter, CRLF, UTF-8 BOM. */
export function toCsv(rows: string[][], delimiter = ";"): string {
  return (
    "﻿" +
    rows.map((r) => r.map((v) => escapeField(v, delimiter)).join(delimiter)).join("\r\n") +
    "\r\n"
  );
}

/** Columns of the catalog file, in export order. */
export const CATALOG_COLUMNS = [
  "slug",
  "name",
  "category",
  "brand",
  "origin_country",
  "price_rub",
  "price_on_request",
  "in_stock",
  "condition",
  "badge",
  "description",
  "features",
  "images",
] as const;

export type CatalogColumn = (typeof CATALOG_COLUMNS)[number];

/** One validated catalog line, ready to upsert. */
export type CatalogRow = {
  slug: string;
  name: string;
  categorySlug: string;
  brand: string;
  originCountry: string;
  priceCents: number;
  priceOnRequest: boolean;
  inStock: boolean;
  /** "used" for б/у. null = the file has no such column: keep what the product has. */
  condition: ProductCondition | null;
  badge: string | null;
  description: string;
  features: string[];
  images: string[];
};

const YES = new Set(["1", "да", "yes", "true", "y", "+", "истина"]);
const NO = new Set(["0", "нет", "no", "false", "n", "-", "", "ложь"]);

function parseBool(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (YES.has(v)) return true;
  if (NO.has(v)) return false;
  return null;
}

/** "12 990,50" / "12990.5" / "12 990 ₽" → kopeks; null when not a number. */
export function parseRubles(raw: string): number | null {
  const cleaned = raw
    .replace(/руб\.?|р\.|₽|[\s\u00a0]/gi, "")
    .replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

/** Split a multi-value cell: "|" or new lines. */
function splitList(raw: string): string[] {
  return raw
    .split(/\||\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type ParseCatalogResult = {
  rows: CatalogRow[];
  /** Human-readable problems, with 1-based spreadsheet line numbers. */
  errors: string[];
};

/**
 * Validate a parsed CSV (header + data lines) against the catalog columns.
 * Unknown columns are ignored; missing optional columns get defaults.
 */
export function parseCatalogCsv(table: string[][]): ParseCatalogResult {
  const errors: string[] = [];
  if (table.length === 0) return { rows: [], errors: ["Файл пустой"] };

  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name: CatalogColumn) => header.indexOf(name);
  for (const required of ["slug", "name", "category"] as const) {
    if (col(required) === -1) errors.push(`Нет обязательной колонки «${required}»`);
  }
  if (errors.length) return { rows: [], errors };

  const rows: CatalogRow[] = [];
  const seen = new Set<string>();

  table.slice(1).forEach((cells, i) => {
    const line = i + 2;
    const get = (name: CatalogColumn) => {
      const idx = col(name);
      return idx === -1 ? "" : (cells[idx] ?? "").trim();
    };

    const slug = get("slug").toLowerCase();
    const name = get("name");
    const categorySlug = get("category").toLowerCase();
    const problems: string[] = [];

    if (!/^[a-z0-9-]{2,}$/.test(slug)) {
      problems.push("slug — только латиница, цифры и дефис");
    } else if (seen.has(slug)) {
      problems.push(`slug «${slug}» повторяется`);
    }
    if (name.length < 2) problems.push("не заполнено name");
    if (!categorySlug) problems.push("не заполнено category");

    const priceOnRequest = parseBool(get("price_on_request")) ?? false;
    const priceRaw = get("price_rub");
    const priceCents = parseRubles(priceRaw);
    if (priceCents === null && !(priceOnRequest && priceRaw === "")) {
      problems.push("price_rub — укажите цену числом");
    } else if (!priceOnRequest && (priceCents ?? 0) <= 0) {
      problems.push("price_rub должна быть больше нуля");
    }

    const inStockRaw = get("in_stock");
    const inStock = inStockRaw === "" ? true : parseBool(inStockRaw);
    if (inStock === null) problems.push("in_stock — да/нет");

    const description = get("description") || name;

    if (problems.length) {
      errors.push(`Строка ${line}: ${problems.join("; ")}`);
      return;
    }
    seen.add(slug);
    rows.push({
      slug,
      name,
      categorySlug,
      brand: get("brand"),
      originCountry: get("origin_country"),
      priceCents: priceCents ?? 0,
      priceOnRequest,
      inStock: inStock ?? true,
      condition: col("condition") === -1 ? null : parseCondition(get("condition")),
      badge: get("badge") || null,
      description,
      features: splitList(get("features")),
      images: splitList(get("images")),
    });
  });

  return { rows, errors };
}

/** A catalog product as a CSV line (inverse of parseCatalogCsv). */
export function catalogRowToCells(r: CatalogRow): string[] {
  return [
    r.slug,
    r.name,
    r.categorySlug,
    r.brand,
    r.originCountry,
    String(r.priceCents / 100),
    r.priceOnRequest ? "да" : "нет",
    r.inStock ? "да" : "нет",
    conditionCell(r.condition ?? "new"),
    r.badge ?? "",
    r.description,
    r.features.join(" | "),
    r.images.join(" | "),
  ];
}
