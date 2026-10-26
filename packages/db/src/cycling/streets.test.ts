import { describe, expect, it } from "vitest";
import { normalizeStreetName, roadClass } from "./streets";

describe("normalizeStreetName", () => {
  it("ignores case, accents and abbreviations", () => {
    expect(normalizeStreetName("Av. Gov. Agamenon Magalhães")).toBe("avenida governador agamenon magalhaes");
    expect(normalizeStreetName("AVENIDA GOVERNADOR AGAMENON MAGALHAES")).toBe("avenida governador agamenon magalhaes");
  });

  it("keeps different streets apart", () => {
    expect(normalizeStreetName("Rua da Aurora")).not.toBe(normalizeStreetName("Rua do Hospício"));
  });
});

describe("roadClass", () => {
  it("groups highway tags by hierarchy", () => {
    expect(roadClass("primary_link")).toBe("estrutural");
    expect(roadClass("tertiary")).toBe("alimentadora");
    expect(roadClass("residential")).toBe("local");
    expect(roadClass("cycleway")).toBe("segregada");
    expect(roadClass(null)).toBeNull();
  });
});
