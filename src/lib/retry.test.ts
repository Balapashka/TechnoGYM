import { describe, expect, it } from "vitest";
import { createSerial, withRetry } from "./retry";

const noSleep = () => Promise.resolve();

describe("withRetry", () => {
  it("retries until a call succeeds", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw new Error("timeout");
        return "ok";
      },
      { attempts: 3, delayMs: 1, sleep: noSleep },
    );
    expect(result).toBe("ok");
    expect(calls).toBe(3);
  });

  it("gives up after the last attempt", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new Error("down");
        },
        { attempts: 3, delayMs: 1, sleep: noSleep },
      ),
    ).rejects.toThrow("down");
    expect(calls).toBe(3);
  });

  it("does not retry an error the caller marks as final", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new Error("Unauthorized");
        },
        { attempts: 3, delayMs: 1, sleep: noSleep, retryable: (e) => !/Unauthorized/.test(String(e)) },
      ),
    ).rejects.toThrow("Unauthorized");
    expect(calls).toBe(1);
  });

  it("waits longer before each next attempt", async () => {
    const pauses: number[] = [];
    await withRetry(
      async (attempt) => {
        if (attempt < 3) throw new Error("x");
      },
      { attempts: 3, delayMs: 100, sleep: async (ms) => void pauses.push(ms) },
    );
    expect(pauses).toEqual([100, 200]);
  });
});

describe("createSerial", () => {
  it("never runs two calls at once, even when one fails", async () => {
    const serial = createSerial();
    let running = 0;
    let peak = 0;
    const job = (fail: boolean) => async () => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 5));
      running -= 1;
      if (fail) throw new Error("409");
      return "done";
    };
    const results = await Promise.allSettled([serial(job(false)), serial(job(true)), serial(job(false))]);
    expect(peak).toBe(1);
    expect(results.map((r) => r.status)).toEqual(["fulfilled", "rejected", "fulfilled"]);
  });
});
