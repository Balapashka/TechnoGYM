import { describe, expect, it } from "vitest";
import { conditionCell, isProductCondition, parseCondition } from "./condition";

describe("parseCondition", () => {
  it("recognises the ways an owner writes «used»", () => {
    for (const v of ["б/у", "Б/У", "Б.У.", "бу", "б у", "used", "Used", "с пробегом", "b/u"]) {
      expect(parseCondition(v)).toBe("used");
    }
  });

  it("treats everything else as new", () => {
    for (const v of ["", "новый", "new", "Новое", undefined, null, "отличное"]) {
      expect(parseCondition(v)).toBe("new");
    }
  });
});

describe("conditionCell", () => {
  it("round-trips through the CSV", () => {
    expect(conditionCell("used")).toBe("б/у");
    expect(conditionCell("new")).toBe("");
    expect(parseCondition(conditionCell("used"))).toBe("used");
    expect(parseCondition(conditionCell("new"))).toBe("new");
  });
});

describe("isProductCondition", () => {
  it("accepts only the stored values", () => {
    expect(isProductCondition("used")).toBe(true);
    expect(isProductCondition("new")).toBe(true);
    expect(isProductCondition("б/у")).toBe(false);
  });
});
