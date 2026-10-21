import { METRICS, type PublicCount, type PublicLocation } from "./shared";

// "Estimada": only some hours were observed and the rest projected.
// "Parcial": only some hours were counted at all.
export type CountNote = "Estimada" | "Parcial";

export function countNote(count: Pick<PublicCount, "estimated" | "partial">): CountNote | null {
  if (count.estimated) return "Estimada";
  if (count.partial) return "Parcial";
  return null;
}

// Change of each count against the previous count of the same place and variant
// (Pista Leste is only compared with Pista Leste). A fraction: 0.12 is +12%.
// Null when there is no earlier count or it had no cyclists.
export function changeSincePrevious(counts: readonly PublicCount[]): Map<number, number | null> {
  const result = new Map<number, number | null>();
  for (const count of counts) {
    const previous = counts
      .filter((c) => c.variant === count.variant && c.date < count.date)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    result.set(count.id, previous && previous.total_cyclists > 0 ? count.total_cyclists / previous.total_cyclists - 1 : null);
  }
  return result;
}

export type CountFilter = {
  year?: number;
  // Drops estimated and partial counts.
  completeOnly?: boolean;
};

// Keeps the counts that pass the filter and drops places left with none.
export function filterLocations(locations: readonly PublicLocation[], filter: CountFilter): PublicLocation[] {
  return locations.flatMap((location) => {
    const counts = location.counts.filter(
      (c) =>
        (filter.year === undefined || Number(c.date.slice(0, 4)) === filter.year) &&
        (!filter.completeOnly || countNote(c) === null),
    );
    return counts.length > 0 ? [{ ...location, counts }] : [];
  });
}

export function yearsOf(locations: readonly PublicLocation[]): number[] {
  const years = new Set(locations.flatMap((l) => l.counts.map((c) => Number(c.date.slice(0, 4)))));
  return [...years].sort((a, b) => b - a);
}

export type CountRow = {
  // The place; `countId` is the specific count.
  id: number;
  countId: number;
  name: string;
  date: string;
  variant: string | null;
  total_cyclists: number;
  note: CountNote | null;
  change: number | null;
};

// One row per count for the public table. Changes are computed on all counts of a
// place, so filtering by year does not hide what the previous count was.
export function countRows(all: readonly PublicLocation[], filtered: readonly PublicLocation[]): CountRow[] {
  const changes = new Map(all.flatMap((l) => [...changeSincePrevious(l.counts)]));
  return filtered.flatMap((location) =>
    location.counts.map((c) => ({
      id: location.id,
      countId: c.id,
      name: location.name,
      date: c.date,
      variant: c.variant,
      total_cyclists: c.total_cyclists,
      note: countNote(c),
      change: changes.get(c.id) ?? null,
    })),
  );
}

const csvCell = (value: string | number | null): string => {
  if (value === null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

// One line per count with every characteristic, for researchers who want a spreadsheet.
export function contagensToCsv(locations: readonly PublicLocation[]): string {
  const header = [
    "local_id",
    "local",
    "latitude",
    "longitude",
    "contagem_id",
    "data",
    "variante",
    "tipo",
    "total_ciclistas",
    "pico_1h",
    ...METRICS.map((m) => m.key),
  ];
  const lines = locations.flatMap((l) =>
    l.counts.map((c) =>
      [
        l.id,
        l.name,
        l.latitude,
        l.longitude,
        c.id,
        c.date,
        c.variant,
        countNote(c)?.toLowerCase() ?? "completa",
        c.total_cyclists,
        c.max_hour_cyclists,
        ...METRICS.map((m) => c.characteristics[m.key]),
      ]
        .map(csvCell)
        .join(","),
    ),
  );
  return [header.join(","), ...lines].join("\r\n");
}
