import { describe, expect, it } from "vitest";
import { splitFeatures } from "./features";

describe("splitFeatures", () => {
  it("splits name: value lines into specs and keeps the rest as notes", () => {
    expect(
      splitFeatures(["Макс. вес пользователя: 150 кг", "Складная конструкция", "Скорость (км/ч): 1–20"]),
    ).toEqual({
      specs: [["Макс. вес пользователя", "150 кг"], ["Скорость (км/ч)", "1–20"]],
      notes: ["Складная конструкция"],
    });
  });
  it("does not treat a URL-like or empty line as a spec", () => {
    expect(splitFeatures(["", "  "]).specs).toEqual([]);
  });
});
