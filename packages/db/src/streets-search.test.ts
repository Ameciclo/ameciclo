import { describe, expect, it } from "vitest";

import { searchTokens } from "./streets-search";

describe("searchTokens", () => {
  it("tira acento e pontuação e usa a abreviação da Prefeitura", () => {
    expect(searchTokens("Av. Governador Agamenon Magalhães")).toEqual(["AV", "GOVERNADOR", "AGAMENON", "MAGALHAES"]);
    expect(searchTokens("avenida agamenon")).toEqual(["AV", "AGAMENON"]);
    expect(searchTokens("Praça do Derby")).toEqual(["PRC", "DO", "DERBY"]);
  });

  it("limita a seis palavras", () => {
    expect(searchTokens("a b c d e f g h")).toHaveLength(6);
  });
});
