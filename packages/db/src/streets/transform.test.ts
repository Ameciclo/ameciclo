import { describe, expect, it } from "vitest";

import { nameKey, toSegment } from "./transform";

const feature = (properties: Record<string, unknown>, geometry: unknown = { type: "MultiLineString", coordinates: [[[-34.9, -8.05], [-34.91, -8.06]]] }) =>
  ({ properties, geometry }) as Parameters<typeof toSegment>[0];

const base = { OBJECTID: 7, CLOGRACODI: 1945, NLOGRACONC: "AV GOVERNADOR AGAMENON MAGALHAES", NLGPAVOFIC: "Avenida Governador Agamenon Magalhães", INDPAV: "Via Pavimentada", "DB2GSE.Sde": 144.6 };

describe("toSegment", () => {
  it("converte um trecho", () => {
    const r = toSegment(feature(base));
    expect("draft" in r && r.draft).toMatchObject({ sourceId: 7, streetCode: 1945, nameKey: "AV GOVERNADOR AGAMENON MAGALHAES", officialName: "Avenida Governador Agamenon Magalhães", lengthM: 144.6 });
  });

  it("a chave do nome é a mesma do SAMU: sem acento, maiúsculas e espaços colapsados", () => {
    expect(nameKey("  Rua  João   da Silva ")).toBe("RUA JOAO DA SILVA");
  });

  it("descarta o que não dá para usar, dizendo o motivo", () => {
    expect(toSegment(feature({ ...base, NLOGRACONC: " " }))).toEqual({ skipped: "sem OBJECTID, código ou nome do logradouro" });
    expect(toSegment(feature({ ...base, "DB2GSE.Sde": null }))).toEqual({ skipped: "sem comprimento" });
    expect(toSegment(feature(base, { type: "Point", coordinates: [0, 0] }))).toEqual({ skipped: "geometria que não é MultiLineString" });
    expect(toSegment(feature(base, { type: "MultiLineString", coordinates: [] }))).toEqual({ skipped: "geometria que não é MultiLineString" });
  });
});

describe("STREET_ALIASES", () => {
  it("só tem nomes sem acento, em maiúsculas, e nenhum apelido aponta para outro apelido", async () => {
    const { STREET_ALIASES } = await import("../samu/streets");
    for (const [from, to] of Object.entries(STREET_ALIASES)) {
      expect(from).toBe(nameKey(from));
      expect(to).toBe(nameKey(to));
      expect(STREET_ALIASES[to]).toBeUndefined();
    }
  });
});
