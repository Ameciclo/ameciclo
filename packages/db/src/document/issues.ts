import type { Basis, ContagemDocument } from "./types";

export type DictionaryEntry = { key: string; parentKey: string | null; isRollup: boolean };

export type DetectedIssue = {
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
  ref: string | null;
};

// Checks that depend only on the document, so they can be recomputed on every
// save. Anything that needs other contagens or the source file stays an
// import-time note.
export const VALIDATION_CODES = [
  "partial_day",
  "unmapped_label",
  "rollup_mismatch",
  "rollup_without_parts",
  "movements_incomplete",
  "many_approaches",
  "topology_mismatch",
  "no_data",
] as const;

const EXPECTED_APPROACHES = { point: 2, t_junction: 3, crossroad: 4 } as const;

export function detectIssues(doc: ContagemDocument, dictionary: DictionaryEntry[]): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const add = (severity: DetectedIssue["severity"], code: string, message: string, ref: string | null = null) =>
    issues.push({ severity, code, message, ref });

  const n = doc.approaches.length;
  const basis: Basis = doc.header.isProjected ? "projected" : "observed";
  const movements = doc.movements.filter((m) => m.basis === basis);

  const expected = EXPECTED_APPROACHES[doc.header.topology];
  if (n > 4) add("warning", "many_approaches", `${n} aproximações; o máximo suportado é 4.`);
  else if (n !== expected) add("warning", "topology_mismatch", `O tipo pede ${expected} aproximações, mas há ${n}.`);
  if (movements.length !== n * (n - 1)) {
    add("warning", "movements_incomplete", `${movements.length} movimentos para ${n} aproximações (esperados ${n * (n - 1)}).`);
  }

  const bucketCount = Math.max(0, ...movements.map((m) => m.cells.length));
  const perBucket = Array.from<number>({ length: bucketCount }).fill(0);
  let total = 0;
  for (const m of movements) {
    m.cells.forEach((v, i) => (perBucket[i] += v));
    total += m.cells.reduce((s, v) => s + v, 0) + (m.total ?? 0);
  }
  if (total === 0) add("info", "no_data", "Nenhum ciclista registrado nos movimentos.");

  const emptyBuckets = perBucket.flatMap((v, i) => (v === 0 ? [i] : []));
  if (total > 0 && !doc.header.isProjected && emptyBuckets.length >= 2 && emptyBuckets.length < bucketCount) {
    const start = Number.parseInt(doc.header.startedAt ?? "6", 10);
    const counted = perBucket
      .flatMap((v, i) => (v > 0 ? [`${start + (i * doc.header.bucketMinutes) / 60}h`] : []))
      .join(", ");
    add("warning", "partial_day", `Só ${counted} têm contagem; ${emptyBuckets.length} de ${bucketCount} horários estão vazios.`);
  }

  const unmapped = new Set<string>();
  for (const o of doc.observations) if (o.characteristicKey === null) unmapped.add(o.rawLabel);
  for (const label of unmapped) add("warning", "unmapped_label", `A característica "${label}" não tem mapeamento.`, label);

  const sumKey = (key: string) =>
    doc.observations
      .filter((o) => o.characteristicKey === key && o.basis === "observed")
      .reduce((s, o) => s + o.cells.reduce((a, v) => a + v, 0) + (o.total ?? 0), 0);
  for (const parent of dictionary.filter((d) => d.isRollup)) {
    const leaves = dictionary.filter((d) => d.parentKey === parent.key).map((d) => d.key);
    const p = sumKey(parent.key);
    const l = leaves.reduce((s, k) => s + sumKey(k), 0);
    const hasLeafRows = doc.observations.some((o) => o.characteristicKey !== null && leaves.includes(o.characteristicKey));
    if (p > 0 && l === 0 && hasLeafRows) {
      add("info", "rollup_without_parts", `${parent.key} é ${p}, mas as linhas aninhadas estão zeradas.`, parent.key);
    } else if (p > 0 && l > 0 && p !== l) {
      const apart = Math.abs(p - l) / Math.max(p, l);
      add(
        apart > 0.25 ? "warning" : "info",
        "rollup_mismatch",
        `${parent.key} é ${p}, mas as partes somam ${l} (${Math.round(apart * 100)}% de diferença).`,
        parent.key,
      );
    }
  }
  return issues;
}
