import type { ContagemDocument } from "./types";

// Returns human-readable problems; an empty list means the document can be saved.
export function validateDocument(doc: ContagemDocument): string[] {
  const problems: string[] = [];
  const h = doc.header;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(h.date)) problems.push("A data precisa estar no formato AAAA-MM-DD.");
  if (doc.approaches.length < 2) problems.push("É preciso ao menos duas aproximações.");
  doc.approaches.forEach((a, i) => {
    if (!a.trim()) problems.push(`A aproximação ${i + 1} está sem nome.`);
  });

  const bucketCount =
    h.startedAt && h.endedAt
      ? Math.round(((Number.parseInt(h.endedAt, 10) - Number.parseInt(h.startedAt, 10)) * 60) / h.bucketMinutes)
      : 0;
  const badCell = (v: number) => !Number.isInteger(v) || v < 0;

  for (const m of doc.movements) {
    if (m.from === m.to) problems.push("Movimentos de uma aproximação para ela mesma não são permitidos.");
    if (m.from >= doc.approaches.length || m.to >= doc.approaches.length) {
      problems.push("Há movimentos que apontam para uma aproximação inexistente.");
    }
    if (bucketCount > 0 && m.cells.length !== bucketCount) problems.push("Um movimento tem quantidade de horários diferente da janela.");
    if (m.cells.some(badCell) || (m.total !== null && badCell(m.total))) {
      problems.push(`Valores de movimento precisam ser inteiros não negativos (${doc.approaches[m.from]} → ${doc.approaches[m.to]}).`);
    }
  }
  for (const o of doc.observations) {
    if (!o.rawLabel.trim()) problems.push("Há uma característica sem rótulo.");
    if (o.cells.some(badCell) || (o.total !== null && badCell(o.total))) {
      problems.push(`Valores de "${o.rawLabel}" precisam ser inteiros não negativos.`);
    }
  }
  for (const n of doc.notes) if (!n.text.trim()) problems.push("Há uma nota vazia.");
  return [...new Set(problems)];
}
