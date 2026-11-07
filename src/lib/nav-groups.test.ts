import { describe, expect, it } from "vitest";
import { USED_HREF, shopColumnsFrom } from "./nav-groups";

const base = {
  categories: [{ slug: "treadmills", name: "Беговые дорожки", count: 3 }],
  brands: [{ name: "UNIX Fit", count: 3 }],
};

const exploreHrefs = (used?: number) =>
  shopColumnsFrom({ ...base, used })
    .find((c) => c.key === "nav.explore")!
    .links.map((l) => l.href);

describe("shopColumnsFrom", () => {
  it("links the used (б/у) listing only when there is something to show", () => {
    expect(exploreHrefs(undefined)).not.toContain(USED_HREF);
    expect(exploreHrefs(0)).not.toContain(USED_HREF);
    expect(exploreHrefs(2)).toContain(USED_HREF);
  });

  it("sends brands with a landing page there", () => {
    const brands = shopColumnsFrom(base).find((c) => c.key === "nav.brands")!;
    expect(brands.links[0].href).toBe("/brand/unix-fit");
  });
});
