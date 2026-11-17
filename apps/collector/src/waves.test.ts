import { describe, expect, it } from "vitest";

import { inWaves } from "./waves";

describe("inWaves", () => {
  it("keeps the order and never runs more than the wave size at once", async () => {
    let running = 0;
    let peak = 0;
    const results = await inWaves([1, 2, 3, 4, 5], 2, async (n, i) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running--;
      return `${i}:${n}`;
    });
    expect(results).toEqual(["0:1", "1:2", "2:3", "3:4", "4:5"]);
    expect(peak).toBe(2);
  });
});
