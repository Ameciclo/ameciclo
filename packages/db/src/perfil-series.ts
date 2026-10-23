// Pure module: safe to import from browser code (no database or Node imports).
//
// Turns the counts the server sends for the Pesquisa Perfil page (already
// crossed by gender and color/race) into chart series, applying the visitor's
// filters. Nothing here ever sees an interview.

import {
  PERFIL_RACES,
  type PerfilCell,
  type PerfilSurveyOption,
} from "./shared";

export type PerfilGender = "all" | "Masculino" | "Feminino";

export type PerfilSelection = {
  gender: PerfilGender;
  // Color/races to show; empty means all of them.
  races: string[];
  // False for surveys that did not ask color/race: everyone goes in one "Todos" series.
  hasRace: boolean;
};

export type PerfilChartDef = {
  key: string;
  title: string;
  // Question answered with a number of days: the range of days to show.
  days?: [number, number];
  // Keep the options in their natural order instead of by size.
  ordered?: boolean;
};

export type PerfilSeries = { name: string; data: { name: string; y: number }[] };

export const dayLabel = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;

const isRace = (race: string) => (PERFIL_RACES as readonly string[]).includes(race);

function keeps(cell: { gender: string; race: string }, sel: PerfilSelection): boolean {
  if (sel.gender !== "all" && cell.gender !== sel.gender) return false;
  if (!sel.hasRace) return true;
  return sel.races.length === 0 ? isRace(cell.race) : sel.races.includes(cell.race);
}

// One series per color/race, or a single "Todos" when the survey has none.
export function seriesGroups(sel: PerfilSelection): string[] {
  if (!sel.hasRace) return ["Todos"];
  return PERFIL_RACES.filter((r) => sel.races.length === 0 || sel.races.includes(r));
}

export function buildSeries(cells: PerfilCell[], def: PerfilChartDef, sel: PerfilSelection): PerfilSeries[] {
  const kept = cells.filter((c) => keeps(c, sel));
  const labelOf = (c: PerfilCell) => (def.days ? dayLabel(Number(c.option)) : c.option);

  let categories: string[];
  if (def.days) {
    const [from, to] = def.days;
    categories = Array.from({ length: to - from + 1 }, (_, i) => dayLabel(from + i));
  } else {
    const totals = new Map<string, { total: number; order: number }>();
    for (const c of kept) {
      const cur = totals.get(c.option) ?? { total: 0, order: c.order };
      cur.total += c.n;
      totals.set(c.option, cur);
    }
    categories = [...totals.entries()]
      .sort((a, b) => (def.ordered ? a[1].order - b[1].order : b[1].total - a[1].total))
      .slice(0, 10)
      .map(([name]) => name);
  }
  const wanted = new Set(categories);

  return seriesGroups(sel)
    .map((group) => {
      const counts = new Map<string, number>();
      for (const c of kept) {
        if (sel.hasRace && c.race !== group) continue;
        const label = labelOf(c);
        if (wanted.has(label)) counts.set(label, (counts.get(label) ?? 0) + c.n);
      }
      return { name: group, data: categories.map((name) => ({ name, y: counts.get(name) ?? 0 })) };
    })
    .filter((s) => s.data.some((d) => d.y > 0));
}

export const PERFIL_DEFAULT_CITY = "Recife";

// The survey to show: the requested city (Recife when unknown) and year (that
// city's latest when missing or unknown). `surveys` comes newest first.
export function chooseSurvey(
  surveys: PerfilSurveyOption[],
  city: string | undefined,
  year: number | undefined,
): PerfilSurveyOption | null {
  const ofCity = (name: string) => surveys.filter((s) => s.city === name);
  const candidates = city && ofCity(city).length > 0 ? ofCity(city) : ofCity(PERFIL_DEFAULT_CITY);
  const pool = candidates.length > 0 ? candidates : surveys;
  return pool.find((s) => s.year === year) ?? pool[0] ?? null;
}
