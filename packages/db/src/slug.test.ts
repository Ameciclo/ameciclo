import { describe, expect, it } from "vitest";
import { contagemSlug, legacyPlaceId, matchesCount, parseContagemSlug, slugify } from "./slug";

const place = "av-rui-barbosa-x-r-amelia";

describe("contagemSlug", () => {
  it("joins the place, the date and, when there is one, the variant", () => {
    expect(contagemSlug(place, { date: "2022-03-30", variant: null })).toBe(`${place}-2022-03-30`);
    expect(contagemSlug("av-agamenon", { date: "2019-09-18", variant: "Pista Leste" })).toBe(
      "av-agamenon-2019-09-18-pista-leste",
    );
  });
});

describe("parseContagemSlug", () => {
  it("splits at the date, whatever the place slug holds", () => {
    expect(parseContagemSlug(`${place}-2022-03-30`)).toEqual({ localSlug: place, date: "2022-03-30", variant: null });
    expect(parseContagemSlug("av-agamenon-2019-09-18-pista-leste")).toEqual({
      localSlug: "av-agamenon",
      date: "2019-09-18",
      variant: "pista-leste",
    });
    expect(parseContagemSlug("av-17-de-agosto-x-rua-alfredo-fernandes-2024-04-11")?.localSlug).toBe(
      "av-17-de-agosto-x-rua-alfredo-fernandes",
    );
  });

  it("keeps the numeric suffix the importer adds to repeated place slugs", () => {
    expect(parseContagemSlug("varadouro-2-2021-09-08")).toEqual({
      localSlug: "varadouro-2",
      date: "2021-09-08",
      variant: null,
    });
  });

  it("returns null for a bare place slug", () => {
    expect(parseContagemSlug(place)).toBeNull();
  });

  it("round-trips every combination", () => {
    for (const variant of [null, "Pista Leste", "Pista Oeste"]) {
      const slug = contagemSlug(place, { date: "2024-05-16", variant });
      const parts = parseContagemSlug(slug);
      expect(parts && matchesCount(parts, { date: "2024-05-16", variant })).toBe(true);
      expect(parts?.localSlug).toBe(place);
    }
  });
});

describe("matchesCount", () => {
  const parts = { localSlug: place, date: "2022-03-30", variant: "pista-leste" };

  it("matches the date and the slugified variant", () => {
    expect(matchesCount(parts, { date: "2022-03-30", variant: "Pista Leste" })).toBe(true);
  });

  it("does not match another date, another variant or a missing one", () => {
    expect(matchesCount(parts, { date: "2022-03-31", variant: "Pista Leste" })).toBe(false);
    expect(matchesCount(parts, { date: "2022-03-30", variant: "Pista Oeste" })).toBe(false);
    expect(matchesCount(parts, { date: "2022-03-30", variant: null })).toBe(false);
    expect(matchesCount({ ...parts, variant: null }, { date: "2022-03-30", variant: "Pista Leste" })).toBe(false);
  });
});

describe("legacyPlaceId", () => {
  it("accepts positive integers only", () => {
    expect(legacyPlaceId("12")).toBe(12);
    for (const bad of ["0", "012", "-3", "1.5", "av-1", ""]) expect(legacyPlaceId(bad)).toBeNull();
  });
});

describe("slugify", () => {
  it("drops accents and punctuation", () => {
    expect(slugify("Av. Dr. José Rufino X R. José Natário")).toBe("av-dr-jose-rufino-x-r-jose-natario");
  });
});
