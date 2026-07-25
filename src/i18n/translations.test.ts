import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  categoryName,
  formatProductCount,
  getTranslation,
  interpolate,
  orderStatusLabel,
  translations,
  type Locale,
} from "./translations";

/** Collect every leaf key path of a translation tree. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("translations", () => {
  it("defaults to Russian with English as the secondary locale", () => {
    expect(DEFAULT_LOCALE).toBe("ru");
    expect(LOCALES.map((l) => l.code)).toEqual(["ru", "en"]);
  });

  it("has the same key set in both locales", () => {
    expect(keyPaths(translations.ru).sort()).toEqual(
      keyPaths(translations.en).sort(),
    );
  });

  it("uses the full Russian names for the equipment categories", () => {
    expect(categoryName("ru", "strength")).toBe("Силовые тренажёры");
    expect(categoryName("ru", "free-weights")).toBe("Свободные веса");
    expect(getTranslation("ru", "nav.cardio")).toBe("Кардиотренажеры");
    expect(getTranslation("ru", "nav.strength")).toBe("Силовые тренажёры");
  });

  it("falls back to the database name for an unknown category slug", () => {
    expect(categoryName("ru", "kettlebells", "Kettlebells")).toBe("Kettlebells");
  });

  it("translates the cart and checkout labels shown in the UI", () => {
    const ru = translations.ru;
    expect(ru.cart.title).toBe("Корзина");
    expect(ru.cart.summary).toBe("Сумма заказа");
    expect(ru.cart.subtotal).toBe("Товары");
    expect(ru.cart.shipping).toBe("Доставка");
    expect(ru.cart.shippingAtCheckout).toBe("Рассчитывается при оформлении");
    expect(ru.cart.checkout).toBe("Перейти к оформлению");
    expect(ru.cart.remove).toBe("Удалить");
  });

  it("leaves no Latin-script leftovers in the Russian cart/checkout copy", () => {
    const allowed = /^(Email|CVC|4242.*)$/;
    for (const [key, value] of Object.entries({
      ...translations.ru.cart,
      ...translations.ru.checkout,
    })) {
      if (allowed.test(value)) continue;
      expect(value, `${key} should be translated`).toMatch(/[А-Яа-яЁё]/);
    }
  });

  it("interpolates variables", () => {
    expect(
      interpolate(getTranslation("ru", "catalog.productCount"), { count: 12 }),
    ).toBe("12 товаров");
  });

  it("returns the key path for a missing translation", () => {
    const locale = "ru" as Locale;
    expect(getTranslation(locale, "nope.missing")).toBe("nope.missing");
  });
});

describe("formatProductCount", () => {
  it("declines the Russian noun correctly", () => {
    expect(formatProductCount("ru", 1)).toBe("1 товар");
    expect(formatProductCount("ru", 2)).toBe("2 товара");
    expect(formatProductCount("ru", 4)).toBe("4 товара");
    expect(formatProductCount("ru", 5)).toBe("5 товаров");
    expect(formatProductCount("ru", 0)).toBe("0 товаров");
  });

  it("handles the 11-14 exception and compound numbers", () => {
    expect(formatProductCount("ru", 11)).toBe("11 товаров");
    expect(formatProductCount("ru", 12)).toBe("12 товаров");
    expect(formatProductCount("ru", 14)).toBe("14 товаров");
    expect(formatProductCount("ru", 21)).toBe("21 товар");
    expect(formatProductCount("ru", 22)).toBe("22 товара");
    expect(formatProductCount("ru", 25)).toBe("25 товаров");
    expect(formatProductCount("ru", 111)).toBe("111 товаров");
    expect(formatProductCount("ru", 121)).toBe("121 товар");
  });

  it("pluralizes English simply", () => {
    expect(formatProductCount("en", 1)).toBe("1 product");
    expect(formatProductCount("en", 3)).toBe("3 products");
  });
});

describe("orderStatusLabel", () => {
  it("localizes every OrderStatus value from the Prisma schema", () => {
    expect(orderStatusLabel("ru", "PENDING")).toBe("В обработке");
    expect(orderStatusLabel("ru", "PAID")).toBe("Оплачен");
    expect(orderStatusLabel("ru", "SHIPPED")).toBe("Отправлен");
    expect(orderStatusLabel("ru", "CANCELLED")).toBe("Отменён");
    expect(orderStatusLabel("en", "PAID")).toBe("Paid");
  });

  it("falls back to the raw value for an unknown status", () => {
    expect(orderStatusLabel("ru", "REFUNDED")).toBe("REFUNDED");
  });
});
