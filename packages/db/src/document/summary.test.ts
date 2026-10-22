import { describe, expect, it } from "vitest";

import { crossroadDocument } from "./fixtures";
import { summarize } from "./summary";

describe("summarize", () => {
  it("sums observed rows per key, cells and session total together, and skips unmapped rows", () => {
    const doc = crossroadDocument();
    doc.observations = [
      { basis: "observed", block: "padroes", position: 0, rawLabel: "Mulheres", characteristicKey: "women", cells: [1, 2, 3], total: null },
      { basis: "observed", block: "padroes", position: 1, rawLabel: "Mulheres 2", characteristicKey: "women", cells: [0, 0, 4], total: 5 },
      { basis: "projected", block: "padroes", position: 2, rawLabel: "Mulheres proj.", characteristicKey: "women", cells: [100], total: null },
      { basis: "observed", block: "observacoes", position: 0, rawLabel: "???", characteristicKey: null, cells: [9], total: null },
    ];
    expect(summarize(doc)).toEqual({ characteristics: { women: 15 } });
  });
});
