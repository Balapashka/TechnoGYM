import { beforeEach, describe, expect, it } from "vitest";
import { useCompareStore, COMPARE_LIMIT } from "./compare-store";

const reset = () => useCompareStore.setState({ ids: [] });

describe("compare-store", () => {
  beforeEach(reset);

  it("toggles an id on and off", () => {
    useCompareStore.getState().toggle("a");
    expect(useCompareStore.getState().ids).toEqual(["a"]);
    useCompareStore.getState().toggle("a");
    expect(useCompareStore.getState().ids).toEqual([]);
  });

  it("enforces the compare limit", () => {
    const ids = ["a", "b", "c", "d", "e"];
    ids.forEach((id) => useCompareStore.getState().toggle(id));
    expect(useCompareStore.getState().ids).toHaveLength(COMPARE_LIMIT);
    expect(useCompareStore.getState().ids).not.toContain("e");
  });

  it("reports full state and membership", () => {
    expect(useCompareStore.getState().isFull()).toBe(false);
    ["a", "b", "c", "d"].forEach((id) =>
      useCompareStore.getState().toggle(id),
    );
    expect(useCompareStore.getState().isFull()).toBe(true);
    expect(useCompareStore.getState().has("a")).toBe(true);
    expect(useCompareStore.getState().has("z")).toBe(false);
  });

  it("removes and clears", () => {
    ["a", "b"].forEach((id) => useCompareStore.getState().toggle(id));
    useCompareStore.getState().remove("a");
    expect(useCompareStore.getState().ids).toEqual(["b"]);
    useCompareStore.getState().clear();
    expect(useCompareStore.getState().ids).toEqual([]);
  });
});
