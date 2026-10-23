import { describe, expect, it } from "vitest";

import { agenciesFromDescription, typologyKey, wayTags } from "./transform";

describe("agenciesFromDescription", () => {
  const agencies = (text: string) => agenciesFromDescription(`CÓD: X | ${text} | Local: y`);

  it("reads the full label", () => {
    expect(agencies("Responsabilidade: Governo do Estado")).toEqual(["Governo do Estado"]);
  });

  it("normalises abbreviations", () => {
    expect(agencies("Resp.: Gov. do Estado")).toEqual(["Governo do Estado"]);
    expect(agencies("Responsabilidade: Pref. de Recife")).toEqual(["Prefeitura de Recife"]);
    expect(agencies("Responsabilidade: Prefeitura de Jaboatão")).toEqual(["Prefeitura de Jaboatão dos Guararapes"]);
  });

  it("splits joint responsibility", () => {
    expect(agencies("Responsabilidade: Prefeitura de Recife / Olinda")).toEqual(["Prefeitura de Recife", "Prefeitura de Olinda"]);
    expect(agencies("Responsabilidade: Prefeitura de Olinda e Recife")).toEqual(["Prefeitura de Olinda", "Prefeitura de Recife"]);
    expect(agencies("Responsabilidade: Prefeitura de São Lourenço da Mata/ Camaragibe")).toEqual([
      "Prefeitura de São Lourenço da Mata",
      "Prefeitura de Camaragibe",
    ]);
  });

  it("keeps Abreu e Lima whole", () => {
    expect(agencies("Responsabilidade: Prefeitura de Abreu e Lima")).toEqual(["Prefeitura de Abreu e Lima"]);
  });

  it("is empty without a responsible", () => {
    expect(agenciesFromDescription("CÓD: X | Local: y")).toEqual([]);
  });
});

describe("wayTags", () => {
  it("promotes the useful tags", () => {
    expect(wayTags({ surface: "asphalt", oneway: "yes", maxspeed: "40", lit: "no" })).toEqual({
      surface: "asphalt",
      oneway: true,
      maxspeedKmh: 40,
      lit: false,
    });
  });

  it("ignores speeds with units", () => {
    expect(wayTags({ maxspeed: "30 mph" }).maxspeedKmh).toBeNull();
  });
});

describe("typologyKey", () => {
  it("maps labels and ignores none", () => {
    expect(typologyKey("Calçada compartilhada")).toBe("calcada_compartilhada");
    expect(typologyKey("none")).toBeNull();
  });
});
