import { describe, expect, it } from "vitest";

import { withRetries } from "./retry";

describe("withRetries", () => {
  it("retries with growing waits and returns the first success", async () => {
    const waits: number[] = [];
    let calls = 0;
    const result = await withRetries(
      async () => {
        calls++;
        if (calls < 3) throw new Error("busy");
        return "ok";
      },
      { attempts: 5, baseMs: 100, sleep: async (ms) => void waits.push(ms) },
    );
    expect(result).toBe("ok");
    expect(waits).toEqual([100, 200]);
  });

  it("gives up with the last error", async () => {
    await expect(
      withRetries(async (n) => Promise.reject(new Error(`falha ${n}`)), { attempts: 2, baseMs: 1, sleep: async () => {} }),
    ).rejects.toThrow("falha 2");
  });

  it("caps the wait", async () => {
    const waits: number[] = [];
    await withRetries(async () => Promise.reject(new Error("x")), { attempts: 4, baseMs: 1000, maxMs: 1500, sleep: async (ms) => void waits.push(ms) }).catch(() => {});
    expect(waits).toEqual([1000, 1500, 1500]);
  });
});
