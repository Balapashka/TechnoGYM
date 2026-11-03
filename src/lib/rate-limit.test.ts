import { describe, expect, it } from "vitest";
import { clientIp, createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit within the window, then blocks", () => {
    const hit = createRateLimiter(() => 0);
    expect(hit("k", 2, 1000).ok).toBe(true);
    expect(hit("k", 2, 1000).ok).toBe(true);
    const blocked = hit("k", 2, 1000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBe(1);
  });

  it("resets after the window and keeps keys separate", () => {
    let now = 0;
    const hit = createRateLimiter(() => now);
    hit("a", 1, 1000);
    expect(hit("a", 1, 1000).ok).toBe(false);
    expect(hit("b", 1, 1000).ok).toBe(true);
    now = 1000;
    expect(hit("a", 1, 1000).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first X-Forwarded-For entry", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to X-Real-IP, then to a shared bucket", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "5.6.7.8" } }))).toBe(
      "5.6.7.8",
    );
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
