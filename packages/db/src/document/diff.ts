import type {
  ContagemDocument,
  DocumentChange,
  DocumentHeader,
  DocumentMovement,
  DocumentObservation,
} from "./types";

const HEADER_LABELS: Record<keyof DocumentHeader, string> = {
  localId: "Local",
  variant: "Variante",
  date: "Data",
  sourceDate: "Data na planilha",
  dateNote: "Nota da data",
  startedAt: "Início",
  endedAt: "Término",
  topology: "Tipo",
  bucketMinutes: "Minutos por intervalo",
  granularity: "Granularidade",
  observedBuckets: "Horários observados",
  isProjected: "Estimada",
  status: "Situação",
  reportUrl: "Relatório",
  notes: "Observações",
  layout: "Layout",
};

const show = (v: unknown): string | null => {
  if (v === null || v === undefined || v === "") return null;
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "sim" : "não";
  return String(v);
};

export function hourText(header: DocumentHeader, bucket: number): string {
  const start = Number.parseInt(header.startedAt ?? "6", 10) * 60;
  const minutes = start + bucket * header.bucketMinutes;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function movementKey(m: DocumentMovement) {
  return `${m.basis}|${m.from}|${m.to}`;
}

function observationKey(o: DocumentObservation) {
  return `${o.basis}|${o.block}|${o.position}`;
}

export function diffDocuments(before: ContagemDocument, after: ContagemDocument): DocumentChange[] {
  const changes: DocumentChange[] = [];
  const push = (c: DocumentChange) => {
    if (c.before !== c.after) changes.push(c);
  };

  for (const key of Object.keys(HEADER_LABELS) as (keyof DocumentHeader)[]) {
    push({
      section: "header",
      label: HEADER_LABELS[key],
      before: show(before.header[key]),
      after: show(after.header[key]),
    });
  }

  const approachCount = Math.max(before.approaches.length, after.approaches.length);
  for (let i = 0; i < approachCount; i++) {
    push({
      section: "approaches",
      label: `Aproximação ${i + 1}`,
      before: show(before.approaches[i]),
      after: show(after.approaches[i]),
    });
  }

  const name = (doc: ContagemDocument, i: number) => doc.approaches[i] ?? `Aproximação ${i + 1}`;
  const basisSuffix = (basis: string, doc: ContagemDocument) =>
    doc.header.isProjected ? ` (${basis === "projected" ? "estimado" : "observado"})` : "";

  const movementsBefore = new Map(before.movements.map((m) => [movementKey(m), m]));
  const movementsAfter = new Map(after.movements.map((m) => [movementKey(m), m]));
  for (const key of new Set([...movementsBefore.keys(), ...movementsAfter.keys()])) {
    const a = movementsBefore.get(key);
    const b = movementsAfter.get(key);
    const ref = b ?? a;
    if (!ref) continue;
    const doc = b ? after : before;
    const base = `${name(doc, ref.from)} → ${name(doc, ref.to)}${basisSuffix(ref.basis, doc)}`;
    if (!a || !b) {
      const sum = (m: DocumentMovement) => m.cells.reduce((s, v) => s + v, 0) + (m.total ?? 0);
      push({ section: "movements", label: base, before: a ? String(sum(a)) : null, after: b ? String(sum(b)) : null });
      continue;
    }
    for (let i = 0; i < Math.max(a.cells.length, b.cells.length); i++) {
      push({
        section: "movements",
        label: `${base} · ${hourText(after.header, i)}`,
        before: show(a.cells[i] ?? 0),
        after: show(b.cells[i] ?? 0),
      });
    }
    push({ section: "movements", label: `${base} · total da sessão`, before: show(a.total), after: show(b.total) });
  }

  const observationsBefore = new Map(before.observations.map((o) => [observationKey(o), o]));
  const observationsAfter = new Map(after.observations.map((o) => [observationKey(o), o]));
  for (const key of new Set([...observationsBefore.keys(), ...observationsAfter.keys()])) {
    const a = observationsBefore.get(key);
    const b = observationsAfter.get(key);
    const ref = b ?? a;
    if (!ref) continue;
    const base = (b ?? ref).rawLabel;
    if (!a || !b) {
      const sum = (o: DocumentObservation) => o.cells.reduce((s, v) => s + v, 0) + (o.total ?? 0);
      push({ section: "observations", label: base, before: a ? String(sum(a)) : null, after: b ? String(sum(b)) : null });
      continue;
    }
    push({ section: "observations", label: `${a.rawLabel} · rótulo`, before: show(a.rawLabel), after: show(b.rawLabel) });
    push({ section: "observations", label: `${base} · característica`, before: show(a.characteristicKey), after: show(b.characteristicKey) });
    for (let i = 0; i < Math.max(a.cells.length, b.cells.length); i++) {
      push({
        section: "observations",
        label: `${base} · ${hourText(after.header, i)}`,
        before: show(a.cells[i] ?? 0),
        after: show(b.cells[i] ?? 0),
      });
    }
    push({ section: "observations", label: `${base} · total`, before: show(a.total), after: show(b.total) });
  }

  const conditionKey = (c: { kind: string; bucket: number }) => `${c.kind}|${c.bucket}`;
  const conditionsBefore = new Map(before.conditions.map((c) => [conditionKey(c), c]));
  const conditionsAfter = new Map(after.conditions.map((c) => [conditionKey(c), c]));
  for (const key of new Set([...conditionsBefore.keys(), ...conditionsAfter.keys()])) {
    const a = conditionsBefore.get(key);
    const b = conditionsAfter.get(key);
    const ref = b ?? a;
    if (!ref) continue;
    const text = (c: typeof a) => (c ? [c.value, c.note].filter((x) => x !== null && x !== "").join(" · ") || "sim" : null);
    push({
      section: "conditions",
      label: `${ref.kind === "rain" ? "Chuva" : ref.kind} · ${hourText(after.header, ref.bucket)}`,
      before: text(a),
      after: text(b),
    });
  }

  const noteCount = Math.max(before.notes.length, after.notes.length);
  for (let i = 0; i < noteCount; i++) {
    push({ section: "notes", label: `Nota ${i + 1}`, before: show(before.notes[i]?.text), after: show(after.notes[i]?.text) });
  }

  return changes;
}
