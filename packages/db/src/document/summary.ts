import type { ContagemBody, ContagemDocument, ContagemSummary } from "./types";

const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);

export function bodyOf(doc: ContagemDocument): ContagemBody {
  return { movements: doc.movements, observations: doc.observations, conditions: doc.conditions, notes: doc.notes };
}

// Observed totals per characteristic, so public lists can read them without
// unpacking the hourly cells. Unmapped rows have no key and are left out.
export function summarize(doc: ContagemDocument): ContagemSummary {
  const characteristics: Record<string, number> = {};
  for (const o of doc.observations) {
    if (o.basis !== "observed" || o.characteristicKey === null) continue;
    characteristics[o.characteristicKey] = (characteristics[o.characteristicKey] ?? 0) + sum(o.cells) + (o.total ?? 0);
  }
  return { characteristics };
}
