import type {
  ContagemDocument,
  DocumentMovement,
  DocumentObservation,
} from "../document/types";
import type { ParsedContagem } from "./parse-workbook";

const pad = (n: number) => String(n).padStart(2, "0");

export type ImportHeader = {
  localId: number;
  variant: string | null;
  date: string;
  sourceDate: string | null;
  dateNote: string | null;
};

// Folds the parser's one-row-per-cell output into the document shape: one entry
// per movement or characteristic row with an array of hourly cells.
export function documentFromParsed(parsed: ParsedContagem, header: ImportHeader): ContagemDocument {
  const highest = Math.max(
    -1,
    ...parsed.movements.map((m) => m.bucket ?? -1),
    ...parsed.observations.map((o) => o.bucket ?? -1),
  );
  const bucketCount = Math.max(parsed.bucketCount, highest + 1);
  const zeros = () => Array.from<number>({ length: bucketCount }).fill(0);

  const movementMap = new Map<string, DocumentMovement>();
  for (const m of parsed.movements) {
    const key = `${m.basis}|${m.from}|${m.to}`;
    const entry = movementMap.get(key) ?? { basis: m.basis, from: m.from, to: m.to, cells: zeros(), total: null };
    if (m.bucket === null) entry.total = (entry.total ?? 0) + m.value;
    else entry.cells[m.bucket] += m.value;
    movementMap.set(key, entry);
  }

  const observationMap = new Map<string, DocumentObservation>();
  for (const o of parsed.observations) {
    const key = `${o.basis}|${o.block}|${o.position}`;
    const entry =
      observationMap.get(key) ??
      {
        basis: o.basis,
        block: o.block,
        position: o.position,
        rawLabel: o.rawLabel,
        characteristicKey: o.characteristicKey,
        cells: zeros(),
        total: null,
      };
    if (o.bucket === null) entry.total = (entry.total ?? 0) + o.value;
    else entry.cells[o.bucket] += o.value;
    observationMap.set(key, entry);
  }

  const endHour = parsed.startHour + (parsed.bucketCount * parsed.bucketMinutes) / 60;
  return {
    schemaVersion: 1,
    header: {
      ...header,
      startedAt: `${pad(parsed.startHour)}:00:00`,
      endedAt: `${pad(Math.floor(endHour))}:00:00`,
      topology: parsed.topology,
      bucketMinutes: parsed.bucketMinutes,
      granularity: "hourly",
      observedBuckets: parsed.observedBuckets,
      isProjected: parsed.isProjected,
      status: "published",
      reportUrl: parsed.reportUrl,
      notes: null,
      layout: parsed.layout,
    },
    approaches: parsed.approaches,
    positions: parsed.positions,
    movements: [...movementMap.values()].sort(
      (a, b) => a.basis.localeCompare(b.basis) || a.from - b.from || a.to - b.to,
    ),
    observations: [...observationMap.values()].sort(
      (a, b) => a.basis.localeCompare(b.basis) || a.block.localeCompare(b.block) || a.position - b.position,
    ),
    conditions: parsed.conditions.map((c) => ({ bucket: c.bucket, kind: c.kind, value: c.value, note: c.note })),
    notes: parsed.notes.map((n) => ({ bucketFrom: n.bucketFrom, bucketTo: n.bucketTo, text: n.text })),
  };
}
