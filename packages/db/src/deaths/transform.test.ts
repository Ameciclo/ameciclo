import { describe, expect, it } from "vitest";

import { parseAge, parseDeathDate, toDraft } from "./transform";

const base = {
  DTOBITO: "01012023",
  CAUSABAS: "V234",
  CODMUNOCOR: "261160",
  CODMUNRES: "240260",
  LOCOCOR: "4",
  SEXO: "1",
  RACACOR: "4",
  IDADE: "424",
  LINHAA: "*T794",
  LINHAB: "*T07X",
  LINHAC: "*V234",
  LINHAD: "NA",
  LINHAII: "",
};

describe("toDraft", () => {
  it("lê um óbito da RMR sem guardar dia, hora nem nascimento", () => {
    const result = toDraft(base);
    expect(result).toEqual({
      draft: {
        year: 2023,
        month: 1,
        occurrenceCity: 261160,
        residenceCity: 240260,
        deathPlace: "4",
        cause: "V234",
        secondaryCauses: "T794 T07X V234",
        sex: "1",
        raceColor: "4",
        ageYears: 24,
      },
    });
  });

  it("aceita quando só a residência é da RMR", () => {
    expect("draft" in toDraft({ ...base, CODMUNOCOR: "240260", CODMUNRES: "261160" })).toBe(true);
  });

  it("descarta o que não é da RMR ou não é acidente de transporte", () => {
    expect(toDraft({ ...base, CODMUNOCOR: "240260" })).toEqual({ skipped: "fora da RMR" });
    expect(toDraft({ ...base, CAUSABAS: "W19" })).toEqual({ skipped: "causa básica fora de V01-V89 e V99" });
    expect(toDraft({ ...base, CAUSABAS: "V950" })).toEqual({ skipped: "causa básica fora de V01-V89 e V99" });
    expect(toDraft({ ...base, CAUSABAS: "Y850" })).toEqual({ skipped: "causa básica fora de V01-V89 e V99" });
    expect("draft" in toDraft({ ...base, CAUSABAS: "V99" })).toBe(true);
    expect(toDraft({ ...base, DTOBITO: "NA" })).toEqual({ skipped: "sem data de óbito" });
  });
});

describe("parseAge", () => {
  it("entende as unidades do SIM", () => {
    expect(parseAge("424")).toBe(24);
    expect(parseAge("501")).toBe(101);
    expect(parseAge("215")).toBe(0);
    expect(parseAge("NA")).toBeNull();
    expect(parseAge("999")).toBeNull();
  });
});

describe("parseDeathDate", () => {
  it("lê DDMMAAAA", () => {
    expect(parseDeathDate("25122019")).toEqual({ year: 2019, month: 12 });
    expect(parseDeathDate("00002019")).toBeNull();
  });
});
