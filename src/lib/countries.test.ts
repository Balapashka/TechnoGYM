import { describe, expect, it } from "vitest";
import {
  ORIGIN_PRIORITY,
  countryCode,
  originFromCode,
  originRank,
} from "./countries";

describe("ORIGIN_PRIORITY", () => {
  it("opens the storefront on Italy, then China", () => {
    expect(ORIGIN_PRIORITY).toEqual(["Италия", "Китай"]);
  });

  it("maps every priority origin to a URL code", () => {
    for (const origin of ORIGIN_PRIORITY) {
      expect(countryCode(origin)).not.toBeNull();
    }
  });
});

describe("originRank", () => {
  it("ranks Italy before China", () => {
    expect(originRank("Италия")).toBeLessThan(originRank("Китай"));
  });

  it("sends unknown origins to the end", () => {
    const unknown = originRank("Германия");
    expect(unknown).toBe(ORIGIN_PRIORITY.length);
    expect(unknown).toBeGreaterThan(originRank("Китай"));
  });

  it("treats an empty origin as unknown", () => {
    expect(originRank("")).toBe(ORIGIN_PRIORITY.length);
  });

  it("ranks unknown origins equally, so their order stays stable", () => {
    expect(originRank("Германия")).toBe(originRank("США"));
  });

  it("orders a mixed list when used as a sort key", () => {
    const origins = ["Китай", "Германия", "Италия", "Китай"];
    const sorted = [...origins].sort((a, b) => originRank(a) - originRank(b));
    expect(sorted).toEqual(["Италия", "Китай", "Китай", "Германия"]);
  });
});

describe("countryCode / originFromCode", () => {
  it("round-trips a known origin", () => {
    expect(originFromCode(countryCode("Италия")!)).toBe("Италия");
    expect(originFromCode(countryCode("Китай")!)).toBe("Китай");
  });

  it("returns null for unmapped values", () => {
    expect(countryCode("Германия")).toBeNull();
    expect(countryCode("")).toBeNull();
    expect(originFromCode("de")).toBeNull();
  });
});
