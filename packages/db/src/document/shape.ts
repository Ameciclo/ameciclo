import { assignPosition, DEFAULT_POSITIONS, type Position } from "../shared";
import type { Basis, ContagemDocument, DocumentMovement } from "./types";

export const TOPOLOGY_APPROACHES = { point: 2, t_junction: 3, crossroad: 4 } as const;

const pad = (n: number) => String(n).padStart(2, "0");

// Resizes the approaches to what the topology needs and keeps the movement set
// consistent: drops movements to removed approaches, adds empty ones for new pairs.
export function reshapeTopology(doc: ContagemDocument, topology: ContagemDocument["header"]["topology"]): ContagemDocument {
  const n = TOPOLOGY_APPROACHES[topology];
  const approaches = Array.from({ length: n }, (_, i) => doc.approaches[i] ?? "");
  const bucketCount = Math.max(0, ...doc.movements.map((m) => m.cells.length));
  const bases = [...new Set(doc.movements.map((m) => m.basis))] as Basis[];
  if (bases.length === 0) bases.push("observed");

  const kept = doc.movements.filter((m) => m.from < n && m.to < n);
  const movements: DocumentMovement[] = [...kept];
  for (const basis of bases) {
    for (let from = 0; from < n; from++) {
      for (let to = 0; to < n; to++) {
        if (from === to || kept.some((m) => m.basis === basis && m.from === from && m.to === to)) continue;
        movements.push({ basis, from, to, cells: Array.from<number>({ length: bucketCount }).fill(0), total: null });
      }
    }
  }
  movements.sort((a, b) => a.basis.localeCompare(b.basis) || a.from - b.from || a.to - b.to);
  // Positions only survive when the number of approaches did not change.
  const positions = doc.positions && doc.positions.length === n ? doc.positions : null;
  return { ...doc, header: { ...doc.header, topology }, approaches, positions, movements };
}

export type NewContagemInput = {
  localId: number;
  date: string;
  variant: string | null;
  startHour: number;
  endHour: number;
  bucketMinutes: number;
  topology: ContagemDocument["header"]["topology"];
  approaches: string[];
  positions?: Position[] | null;
  reportUrl: string | null;
};

// A new contagem starts as a draft with every movement at zero.
export function buildNewDocument(input: NewContagemInput): ContagemDocument {
  const bucketCount = Math.max(1, Math.round(((input.endHour - input.startHour) * 60) / input.bucketMinutes));
  const base: ContagemDocument = {
    schemaVersion: 1,
    header: {
      localId: input.localId,
      variant: input.variant,
      date: input.date,
      sourceDate: null,
      dateNote: null,
      startedAt: `${pad(input.startHour)}:00:00`,
      endedAt: `${pad(input.endHour)}:00:00`,
      topology: input.topology,
      bucketMinutes: input.bucketMinutes,
      granularity: "hourly",
      observedBuckets: null,
      isProjected: false,
      status: "draft",
      reportUrl: input.reportUrl,
      notes: null,
      layout: null,
    },
    approaches: input.approaches,
    positions: input.positions ?? null,
    movements: [
      { basis: "observed", from: 0, to: 1, cells: Array.from<number>({ length: bucketCount }).fill(0), total: null },
    ],
    observations: [],
    conditions: [],
    notes: [],
  };
  return reshapeTopology(base, input.topology);
}

export function addObservationRow(doc: ContagemDocument, key: string, label: string): ContagemDocument {
  const bucketCount = Math.max(0, ...doc.movements.map((m) => m.cells.length));
  const position = Math.max(-1, ...doc.observations.filter((o) => o.block === "observacoes").map((o) => o.position)) + 1;
  return {
    ...doc,
    observations: [
      ...doc.observations,
      {
        basis: "observed",
        block: "observacoes",
        position,
        rawLabel: label,
        characteristicKey: key,
        cells: Array.from<number>({ length: bucketCount }).fill(0),
        total: null,
      },
    ],
  };
}

// The stored positions, or the default order when none were set.
export function effectivePositions(doc: ContagemDocument): Position[] {
  if (doc.positions && doc.positions.length === doc.approaches.length) return doc.positions;
  return [...DEFAULT_POSITIONS[doc.header.topology]].slice(0, doc.approaches.length);
}

export function setPosition(doc: ContagemDocument, index: number, position: Position): ContagemDocument {
  return { ...doc, positions: assignPosition(effectivePositions(doc), index, position) };
}
