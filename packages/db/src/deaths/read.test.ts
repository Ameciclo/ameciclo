import { describe, expect, it } from "vitest";

import { counterpart, summarizeDeaths, victimMode } from "./read";

describe("victimMode / counterpart", () => {
  it("classifica quem morreu e com quem colidiu", () => {
    expect(victimMode("V234")).toBe("motociclista");
    expect(counterpart("V234")).toBe("automovel");
    expect(victimMode("V031")).toBe("pedestre");
    expect(counterpart("V031")).toBe("automovel");
    expect(victimMode("V124")).toBe("ciclista");
    expect(counterpart("V124")).toBe("motociclista");
    expect(counterpart("V470")).toBe("objeto_fixo");
    expect(victimMode("V870")).toBe("outros");
    expect(victimMode("V530")).toBe("automovel");
    expect(victimMode("V780")).toBe("onibus");
  });
  it("pedestre atropelado por trem ou sem especificação", () => {
    expect(counterpart("V050")).toBe("outros");
    expect(counterpart("V090")).toBe("nao_especificado");
  });
});

describe("summarizeDeaths", () => {
  const row = (o: Partial<Parameters<typeof summarizeDeaths>[0][number]>) => ({
    year: 2022,
    cause: "V234",
    secondaryCauses: null,
    sex: "1",
    raceColor: "4",
    ageYears: 30,
    ...o,
  });

  it("soma por ano, modo, sexo, raça, idade e causas secundárias", () => {
    const s = summarizeDeaths([
      row({ secondaryCauses: "T794 V234 T794 V099 S061 S069" }),
      row({ year: 2023, cause: "V031", sex: "2", raceColor: null, ageYears: 80, secondaryCauses: "T794" }),
    ]);
    expect(s.total).toBe(2);
    expect(s.byYear).toEqual([{ year: 2022, total: 1 }, { year: 2023, total: 1 }]);
    expect(s.byMode.motociclista).toBe(1);
    expect(s.matrix.pedestre.automovel).toBe(1);
    expect(s.bySex).toEqual({ masculino: 1, feminino: 1, ignorado: 0 });
    expect(s.byRace.map((r) => r.label).sort()).toEqual(["Ignorada", "Parda"]);
    expect(s.byAge.map((a) => a.label)).toEqual(["30 a 44", "75 ou mais"]);
    // T794 vira T79; S061 e S069 na mesma declaração valem uma citação de S06.
    expect(s.secondaryCauses).toEqual([{ code: "T79", total: 2 }, { code: "S06", total: 1 }]);
    expect(s.byVictim.motociclista.total).toBe(1);
    expect(s.byVictim.motociclista.secondaryCauses).toEqual([{ code: "S06", total: 1 }, { code: "T79", total: 1 }]);
    expect(s.byVictim.pedestre.bySex).toEqual({ masculino: 0, feminino: 1, ignorado: 0 });
    expect(s.byVictim.ciclista.total).toBe(0);
  });
});
