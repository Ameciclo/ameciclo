import { describe, expect, it } from "vitest";

import { normalizeName, parseAge, parseDate, parseStreet, parseTime, toDraft } from "./transform";

describe("parseDate", () => {
  it("keeps the day of an ISO timestamp", () => expect(parseDate("2018-01-01T00:00:00Z")).toBe("2018-01-01"));
  it("rejects what is not a date", () => {
    expect(parseDate("")).toBeNull();
    expect(parseDate("2018-02-31T00:00:00Z")).toBeNull();
  });
});

describe("parseTime", () => {
  it("reads both spellings", () => {
    expect(parseTime("0:09")).toBe("00:09:00");
    expect(parseTime("00:27:21")).toBe("00:27:21");
  });
  it("rejects out-of-range times", () => expect(parseTime("25:00")).toBeNull());
});

describe("parseAge", () => {
  it("treats 0 (not informed) and typos as empty", () => {
    expect(parseAge("0")).toBeNull();
    expect(parseAge("")).toBeNull();
    expect(parseAge("647")).toBeNull();
  });
  it("keeps real ages", () => expect(parseAge("40")).toBe(40));
});

describe("parseStreet", () => {
  it("drops placeholders", () => {
    expect(parseStreet("NAO IDENTIFICADO")).toBeNull();
    expect(parseStreet("#N/A")).toBeNull();
    expect(parseStreet("")).toBeNull();
  });
  it("keeps a street", () => expect(parseStreet("AV DR JOSE RUFINO")).toBe("AV DR JOSE RUFINO"));
});

describe("normalizeName", () => {
  it("matches the spreadsheet spelling with the municipality list", () =>
    expect(normalizeName("Jaboatão dos Guararapes")).toBe("JABOATAO DOS GUARARAPES"));
});

describe("toDraft", () => {
  const raw = {
    _id: "11",
    data: "2018-01-01T00:00:00Z",
    hora_minuto: "0:30",
    municipio: "RECIFE",
    origem_chamado: "VIA PUBL",
    categoria: "Atropelamento por Carro",
    sexo: "Masculino",
    idade: "10",
    endereco_pcr: "AV DR JOSE RUFINO",
    motivo_desf_cat: "Atendimento Concluído com Êxito",
  };

  it("builds a draft", () => {
    const r = toDraft(raw, 3);
    expect(r).toMatchObject({
      draft: { sourceId: 11, sourceRow: 3, occurredOn: "2018-01-01", occurredAt: "00:30:00", origin: "Via pública", age: 10 },
    });
  });
  it("skips a row without a category", () => expect(toDraft({ ...raw, categoria: "" }, 1)).toEqual({ skipped: "sem categoria" }));
});
