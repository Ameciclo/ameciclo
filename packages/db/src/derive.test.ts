import { describe, expect, it } from "vitest";
import { changeSincePrevious, contagensToCsv, countNote, countRows, filterLocations, yearsOf } from "./derive";
import type { PublicCount, PublicLocation } from "./shared";

const zero = {
  women: 0,
  juveniles: 0,
  helmet: 0,
  sidewalk: 0,
  shared_bike: 0,
  ride: 0,
  cargo: 0,
  service: 0,
  wrong_way: 0,
  motor: 0,
};

const count = (id: number, date: string, total: number, extra: Partial<PublicCount> = {}): PublicCount => ({
  id,
  date,
  variant: null,
  total_cyclists: total,
  max_hour_cyclists: Math.round(total / 8),
  estimated: false,
  partial: false,
  characteristics: zero,
  ...extra,
});

const place = (id: number, name: string, counts: PublicCount[]): PublicLocation => ({
  id,
  name,
  slug: name.toLowerCase(),
  latitude: -8.05,
  longitude: -34.9,
  counts,
});

describe("countNote", () => {
  it("labels estimated and partial counts, and nothing else", () => {
    expect(countNote({ estimated: true, partial: false })).toBe("Estimada");
    expect(countNote({ estimated: false, partial: true })).toBe("Parcial");
    expect(countNote({ estimated: false, partial: false })).toBeNull();
  });
});

describe("changeSincePrevious", () => {
  it("compares each count with the previous one of the same variant", () => {
    const counts = [
      count(3, "2024-05-16", 150, { variant: "Pista Leste" }),
      count(2, "2024-05-16", 900, { variant: "Pista Oeste" }),
      count(1, "2019-09-18", 100, { variant: "Pista Leste" }),
      count(0, "2019-09-18", 600, { variant: "Pista Oeste" }),
    ];
    const change = changeSincePrevious(counts);
    expect(change.get(3)).toBeCloseTo(0.5);
    expect(change.get(2)).toBeCloseTo(0.5);
    expect(change.get(1)).toBeNull();
  });

  it("has no change when the previous count had no cyclists", () => {
    const change = changeSincePrevious([count(2, "2024-01-01", 10), count(1, "2019-01-01", 0)]);
    expect(change.get(2)).toBeNull();
  });
});

describe("filterLocations", () => {
  const locations = [
    place(1, "A", [count(11, "2026-03-25", 100), count(10, "2019-05-08", 80, { estimated: true })]),
    place(2, "B", [count(20, "2019-03-13", 50)]),
  ];

  it("keeps only the counts of the chosen year and drops empty places", () => {
    expect(filterLocations(locations, { year: 2026 }).map((l) => l.id)).toEqual([1]);
    expect(filterLocations(locations, { year: 2019 }).flatMap((l) => l.counts.map((c) => c.id))).toEqual([10, 20]);
  });

  it("can hide estimated and partial counts", () => {
    const result = filterLocations(locations, { completeOnly: true });
    expect(result.flatMap((l) => l.counts.map((c) => c.id))).toEqual([11, 20]);
  });

  it("lists the years, newest first", () => {
    expect(yearsOf(locations)).toEqual([2026, 2019]);
  });

  it("keeps the change against the previous count even when it is filtered out", () => {
    const rows = countRows(locations, filterLocations(locations, { year: 2026 }));
    expect(rows).toHaveLength(1);
    expect(rows[0].change).toBeCloseTo(0.25);
  });
});

describe("contagensToCsv", () => {
  it("writes a header and one line per count", () => {
    const csv = contagensToCsv([place(1, "Rua A", [count(11, "2026-03-25", 1808, { characteristics: { ...zero, women: 102 } })])]);
    const [header, line] = csv.split("\r\n");
    expect(header.startsWith("local_id,local,latitude,longitude,contagem_id,data,variante,tipo,total_ciclistas,pico_1h,women")).toBe(true);
    expect(line).toBe("1,Rua A,-8.05,-34.9,11,2026-03-25,,completa,1808,226,102,0,0,0,0,0,0,0,0,0");
  });

  it("quotes names with commas and quotes", () => {
    const csv = contagensToCsv([place(1, 'Av. "Gov.", x Praça', [count(1, "2026-01-01", 1, { estimated: true })])]);
    expect(csv.split("\r\n")[1]).toContain('"Av. ""Gov."", x Praça"');
    expect(csv.split("\r\n")[1]).toContain(",estimada,");
  });
});
