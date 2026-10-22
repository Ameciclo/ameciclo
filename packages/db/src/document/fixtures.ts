import { buildNewDocument } from "./shape";
import type { ContagemDocument } from "./types";

// A small crossroad: 4 approaches, 12 movements, 3 hourly buckets, 1 cyclist per cell.
export function crossroadDocument(overrides: Partial<ContagemDocument["header"]> = {}): ContagemDocument {
  const doc = buildNewDocument({
    localId: 1,
    date: "2026-03-25",
    variant: null,
    startHour: 6,
    endHour: 9,
    bucketMinutes: 60,
    topology: "crossroad",
    approaches: ["Norte", "Leste", "Sul", "Oeste"],
    reportUrl: null,
  });
  return {
    ...doc,
    header: { ...doc.header, ...overrides },
    movements: doc.movements.map((m) => ({ ...m, cells: m.cells.map(() => 1) })),
  };
}
