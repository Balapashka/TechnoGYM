import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("transliterates Cyrillic and keeps model codes", () => {
    expect(slugify("Беговая дорожка UNIX Fit R-240")).toBe("begovaya-dorozhka-unix-fit-r-240");
  });
  it("handles ё, щ, soft signs and punctuation", () => {
    expect(slugify("Щётка «Ёж» №1, 20 кг")).toBe("shchetka-ezh-no1-20-kg");
    expect(slugify("Йога-коврик")).toBe("yoga-kovrik");
    expect(slugify("Скамья силовая")).toBe("skamya-silovaya");
  });
  it("drops accents and trims dashes", () => {
    expect(slugify("  Café — Ride! ")).toBe("cafe-ride");
  });
  it("caps the length without a trailing dash", () => {
    const s = slugify("а".repeat(50) + " b", 30);
    expect(s.length).toBeLessThanOrEqual(30);
    expect(s.endsWith("-")).toBe(false);
  });
});
