import { describe, expect, it } from "vitest";
import {
  CATALOG_COLUMNS,
  catalogRowToCells,
  decodeCsvBytes,
  detectDelimiter,
  parseCatalogCsv,
  parseCsv,
  parseRubles,
  toCsv,
} from "./csv";

describe("parseCsv", () => {
  it("handles quotes, escaped quotes and newlines inside fields", () => {
    const text = 'a;b;c\r\n"x;1";"say ""hi""";"line1\nline2"\r\n';
    expect(parseCsv(text)).toEqual([
      ["a", "b", "c"],
      ["x;1", 'say "hi"', "line1\nline2"],
    ]);
  });

  it("detects the delimiter from the header", () => {
    expect(detectDelimiter("slug,name,category\n")).toBe(",");
    expect(detectDelimiter("slug;name;category\n")).toBe(";");
  });

  it("drops blank lines", () => {
    expect(parseCsv("a,b\n\n1,2\n\n")).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("round-trips through toCsv", () => {
    const rows = [["slug", "name"], ["x", 'Скамья "Pro"; 3 в 1']];
    expect(parseCsv(toCsv(rows).replace(/^﻿/, ""))).toEqual(rows);
  });
});

describe("decodeCsvBytes", () => {
  it("reads UTF-8 with a BOM", () => {
    const bytes = new TextEncoder().encode("﻿слаг");
    expect(decodeCsvBytes(bytes)).toBe("слаг");
  });

  it("falls back to Windows-1251", () => {
    // "Да" in cp1251
    expect(decodeCsvBytes(new Uint8Array([0xc4, 0xe0]))).toBe("Да");
  });
});

describe("parseRubles", () => {
  it("accepts Russian number formats", () => {
    expect(parseRubles("12 990")).toBe(1299000);
    expect(parseRubles("12990,50")).toBe(1299050);
    expect(parseRubles("12 990 ₽")).toBe(1299000);
    expect(parseRubles("12990.5 руб.")).toBe(1299050);
    expect(parseRubles("abc")).toBeNull();
    expect(parseRubles("")).toBeNull();
  });
});

const header = [...CATALOG_COLUMNS];

describe("parseCatalogCsv", () => {
  it("parses a valid row with defaults", () => {
    const res = parseCatalogCsv([
      ["slug", "name", "category", "price_rub"],
      ["Bench-1", "Скамья", "benches", "9 990"],
    ]);
    expect(res.errors).toEqual([]);
    expect(res.rows[0]).toMatchObject({
      slug: "bench-1",
      priceCents: 999000,
      inStock: true,
      priceOnRequest: false,
      description: "Скамья",
    });
  });

  it("allows an empty price for price-on-request items", () => {
    const res = parseCatalogCsv([
      ["slug", "name", "category", "price_rub", "price_on_request"],
      ["rack-1", "Стойка", "racks", "", "да"],
    ]);
    expect(res.errors).toEqual([]);
    expect(res.rows[0].priceOnRequest).toBe(true);
  });

  it("reports bad lines with spreadsheet line numbers and keeps good ones", () => {
    const res = parseCatalogCsv([
      ["slug", "name", "category", "price_rub"],
      ["ok-1", "Товар", "bikes", "100"],
      ["плохой", "", "bikes", "0"],
      ["ok-1", "Дубль", "bikes", "100"],
    ]);
    expect(res.rows).toHaveLength(1);
    expect(res.errors[0]).toMatch(/^Строка 3:/);
    expect(res.errors[1]).toMatch(/^Строка 4: slug «ok-1» повторяется/);
  });

  it("requires the key columns", () => {
    expect(parseCatalogCsv([["name"]]).errors[0]).toContain("slug");
  });

  it("splits features and images on | or new lines", () => {
    const res = parseCatalogCsv([
      header,
      ["a-1", "Дорожка", "treadmills", "Brand", "Китай", "1000", "нет", "нет", "", "Описание",
        "Мотор 2 л.с. | Скорость 16 км/ч", "https://x.ru/1.jpg\nhttps://x.ru/2.jpg"],
    ]);
    expect(res.rows[0].features).toEqual(["Мотор 2 л.с.", "Скорость 16 км/ч"]);
    expect(res.rows[0].images).toHaveLength(2);
    expect(res.rows[0].inStock).toBe(false);
  });

  it("round-trips an exported row", () => {
    const row = {
      slug: "x-1",
      name: "Товар",
      categorySlug: "bikes",
      brand: "UNIX Fit",
      originCountry: "Китай",
      priceCents: 1299050,
      priceOnRequest: false,
      inStock: true,
      badge: "Новинка",
      description: "Описание",
      features: ["a", "b"],
      images: ["/uploads/1.jpg"],
    };
    expect(parseCatalogCsv([header, catalogRowToCells(row)]).rows[0]).toEqual(row);
  });
});
