import { describe, expect, it } from "vitest";
import {
  PAGE_SIZE,
  chunkLimit,
  expandBy,
  initialExpansion,
} from "./catalog-paging";

describe("catalog paging", () => {
  it("starts at one chunk", () => {
    expect(chunkLimit(initialExpansion("a"), "a")).toBe(PAGE_SIZE);
  });

  it("grows by one chunk per expansion", () => {
    let expansion = initialExpansion("a");
    expansion = expandBy("a", chunkLimit(expansion, "a"));
    expect(chunkLimit(expansion, "a")).toBe(PAGE_SIZE * 2);
    expansion = expandBy("a", chunkLimit(expansion, "a"));
    expect(chunkLimit(expansion, "a")).toBe(PAGE_SIZE * 3);
  });

  it("falls back to the first chunk when the query changes", () => {
    // Expanding under one set of filters must not leak into the next: after a
    // narrowing filter the visitor should land back at the top of the grid.
    const expansion = expandBy("a", PAGE_SIZE * 4);
    expect(chunkLimit(expansion, "b")).toBe(PAGE_SIZE);
  });

  it("restores the expansion when the query comes back", () => {
    const expansion = expandBy("a", PAGE_SIZE * 2);
    expect(chunkLimit(expansion, "b")).toBe(PAGE_SIZE);
    expect(chunkLimit(expansion, "a")).toBe(PAGE_SIZE * 3);
  });
});
