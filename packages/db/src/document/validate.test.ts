import { describe, expect, it } from "vitest";
import { crossroadDocument } from "./fixtures";
import { validateDocument } from "./validate";

describe("validateDocument", () => {
  it("accepts a well-formed document", () => {
    expect(validateDocument(crossroadDocument())).toEqual([]);
  });

  it("rejects a date that is not ISO", () => {
    const doc = crossroadDocument({ date: "25/03/2026" });
    expect(validateDocument(doc)).toEqual(["A data precisa estar no formato AAAA-MM-DD."]);
  });

  it("rejects blank approach names and fewer than two approaches", () => {
    const doc = { ...crossroadDocument(), approaches: [" "] };
    const problems = validateDocument(doc);
    expect(problems).toContain("É preciso ao menos duas aproximações.");
    expect(problems).toContain("A aproximação 1 está sem nome.");
  });

  it("rejects duplicated or missing positions", () => {
    const doc = crossroadDocument();
    expect(validateDocument({ ...doc, positions: ["N", "N", "S", "W"] })).toEqual([
      "Duas aproximações não podem ter a mesma posição.",
    ]);
    expect(validateDocument({ ...doc, positions: ["N", "E"] })).toEqual(["Cada aproximação precisa de uma posição."]);
  });

  it("rejects negative and fractional cells", () => {
    const doc = crossroadDocument();
    doc.movements[0].cells[0] = -1;
    doc.movements[1].cells[0] = 1.5;
    expect(validateDocument(doc)).toHaveLength(2);
  });

  it("rejects a movement to its own approach or to one that does not exist", () => {
    const doc = crossroadDocument();
    doc.movements[0].to = doc.movements[0].from;
    doc.movements[1].to = 9;
    const problems = validateDocument(doc);
    expect(problems).toContain("Movimentos de uma aproximação para ela mesma não são permitidos.");
    expect(problems).toContain("Há movimentos que apontam para uma aproximação inexistente.");
  });

  it("rejects a movement whose hours do not match the counting window", () => {
    const doc = crossroadDocument();
    doc.movements[0].cells.pop();
    expect(validateDocument(doc)).toEqual(["Um movimento tem quantidade de horários diferente da janela."]);
  });
});
