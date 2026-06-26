import { describe, expect, it } from "vitest";
import { getMedia, resolveMediaSrc, hasRealAsset, media } from "./media";

describe("media loader", () => {
  it("drops the documentation key from exposed slots", () => {
    expect("$comment" in media).toBe(false);
    expect(media.hero).toBeDefined();
  });

  it("falls back to the placeholder when src is null", () => {
    const hero = getMedia("hero");
    expect(hero.src).toBeNull();
    expect(resolveMediaSrc("hero")).toBe(hero.placeholder);
    expect(hasRealAsset("hero")).toBe(false);
  });

  it("exposes exact dimensions for each slot", () => {
    expect(getMedia("productCard").width).toBe(1000);
    expect(getMedia("productCard").height).toBe(1000);
    expect(getMedia("hero").width).toBe(1920);
  });

  it("throws on an unknown slot", () => {
    expect(() => getMedia("nope")).toThrow(/Unknown media slot/);
  });
});
