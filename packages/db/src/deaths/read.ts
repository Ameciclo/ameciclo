import { and, between, eq, inArray, sql, type SQL } from "drizzle-orm";

import type { Db } from "../index";
import { trafficDeath } from "../schema";
import { RMR_SIM_CODES } from "./transform";

// ---------------------------------------------------------------------------
// Leituras das mortes no trânsito. Só estatísticas: nenhuma linha sai daqui.
// "Ocorrência" é o município onde a pessoa morreu (o SIM não diz onde o sinistro
// aconteceu); "residência" é o município onde morava.
// ---------------------------------------------------------------------------

export const RMR_CITY_NAMES: Record<number, string> = {
  260005: "Abreu e Lima",
  260105: "Araçoiaba",
  260290: "Cabo de Santo Agostinho",
  260345: "Camaragibe",
  260680: "Igarassu",
  260720: "Ilha de Itamaracá",
  260760: "Ipojuca",
  260775: "Itapissuma",
  260790: "Jaboatão dos Guararapes",
  260940: "Moreno",
  260960: "Olinda",
  261070: "Paulista",
  261160: "Recife",
  261370: "São Lourenço da Mata",
};

export type Basis = "ocorrencia" | "residencia";

export const MODES = ["pedestre", "ciclista", "motociclista", "automovel", "onibus", "outros"] as const;
export type Mode = (typeof MODES)[number];

// Quem morreu, pelo número da causa básica (V01 a V89).
export function victimMode(cause: string): Mode {
  const n = Number(cause.slice(1, 3));
  if (n >= 1 && n <= 9) return "pedestre";
  if (n >= 10 && n <= 19) return "ciclista";
  if (n >= 20 && n <= 29) return "motociclista";
  if (n >= 40 && n <= 59) return "automovel";
  if (n >= 70 && n <= 79) return "onibus";
  return "outros";
}

export const COUNTERPARTS = [
  "pedestre",
  "ciclista",
  "motociclista",
  "automovel",
  "onibus",
  "outros",
  "objeto_fixo",
  "sem_colisao",
  "nao_especificado",
] as const;
export type Counterpart = (typeof COUNTERPARTS)[number];

// Com quem ou com o quê colidiu, pelo último dígito da causa básica.
export function counterpart(cause: string): Counterpart {
  const digit = cause[2];
  if (victimMode(cause) === "pedestre") {
    return ({ "1": "ciclista", "2": "motociclista", "3": "automovel", "4": "onibus", "5": "outros", "6": "ciclista" } as Record<string, Counterpart>)[digit] ?? "nao_especificado";
  }
  return (
    ({
      "0": "pedestre",
      "1": "ciclista",
      "2": "motociclista",
      "3": "automovel",
      "4": "onibus",
      "5": "outros",
      "6": "ciclista",
      "7": "objeto_fixo",
      "8": "sem_colisao",
    } as Record<string, Counterpart>)[digit] ?? "nao_especificado"
  );
}

const AGE_BANDS = [
  { label: "0 a 14", max: 14 },
  { label: "15 a 29", max: 29 },
  { label: "30 a 44", max: 44 },
  { label: "45 a 59", max: 59 },
  { label: "60 a 74", max: 74 },
  { label: "75 ou mais", max: Infinity },
] as const;

export type DeathFilters = {
  basis: Basis;
  /** Código do SIM (6 dígitos) de um município da RMR; sem ele, a RMR inteira. */
  city?: number;
  yearFrom?: number;
  yearTo?: number;
  /** Local do óbito: 1 hospital, 2 outro estabelecimento, 3 domicílio, 4 via pública, 5 outros, 9 ignorado. */
  places?: string[];
};

export type DeathRow = {
  year: number;
  cause: string;
  secondaryCauses: string | null;
  sex: string | null;
  raceColor: string | null;
  ageYears: number | null;
};

export type DeathStats = {
  total: number;
  byYear: { year: number; total: number }[];
  byYearMode: ({ year: number } & Record<Mode, number>)[];
  byMode: Record<Mode, number>;
  /** matrix[vítima][contraparte]: só ciclistas, pedestres, motociclistas, automóveis, ônibus e outros como vítima. */
  matrix: Record<Mode, Record<Counterpart, number>>;
  bySex: { masculino: number; feminino: number; ignorado: number };
  byRace: { label: string; total: number }[];
  byAge: { label: string; total: number }[];
  /** Códigos CID-10 mais citados nas causas secundárias, com quantas declarações os citam. */
  secondaryCauses: { code: string; total: number }[];
};

const RACES: Record<string, string> = { "1": "Branca", "2": "Preta", "3": "Amarela", "4": "Parda", "5": "Indígena" };

const zeroByMode = (): Record<Mode, number> => ({ pedestre: 0, ciclista: 0, motociclista: 0, automovel: 0, onibus: 0, outros: 0 });
const zeroMatrix = () =>
  Object.fromEntries(
    MODES.map((m) => [m, Object.fromEntries(COUNTERPARTS.map((c) => [c, 0]))]),
  ) as Record<Mode, Record<Counterpart, number>>;

/** Agrega as linhas já filtradas. Pura, para testar sem banco. */
export function summarizeDeaths(rows: DeathRow[], limitSecondary = 12): DeathStats {
  const byYear = new Map<number, { total: number; modes: Record<Mode, number> }>();
  const byMode = zeroByMode();
  const matrix = zeroMatrix();
  const bySex = { masculino: 0, feminino: 0, ignorado: 0 };
  const race = new Map<string, number>();
  const age = new Map<string, number>();
  const secondary = new Map<string, number>();

  for (const r of rows) {
    const mode = victimMode(r.cause);
    const y = byYear.get(r.year) ?? { total: 0, modes: zeroByMode() };
    y.total += 1;
    y.modes[mode] += 1;
    byYear.set(r.year, y);
    byMode[mode] += 1;
    matrix[mode][counterpart(r.cause)] += 1;

    if (r.sex === "1") bySex.masculino += 1;
    else if (r.sex === "2") bySex.feminino += 1;
    else bySex.ignorado += 1;

    const raceLabel = (r.raceColor && RACES[r.raceColor]) || "Ignorada";
    race.set(raceLabel, (race.get(raceLabel) ?? 0) + 1);

    if (r.ageYears !== null) {
      const band = AGE_BANDS.find((b) => r.ageYears! <= b.max)!.label;
      age.set(band, (age.get(band) ?? 0) + 1);
    }

    // Cada código conta uma vez por declaração, mesmo que repetido em linhas diferentes.
    for (const code of new Set(r.secondaryCauses?.split(" ").filter(Boolean) ?? [])) {
      if (code !== r.cause) secondary.set(code, (secondary.get(code) ?? 0) + 1);
    }
  }

  const years = [...byYear.keys()].sort((a, b) => a - b);
  return {
    total: rows.length,
    byYear: years.map((year) => ({ year, total: byYear.get(year)!.total })),
    byYearMode: years.map((year) => ({ year, ...byYear.get(year)!.modes })),
    byMode,
    matrix,
    bySex,
    byRace: [...race].map(([label, total]) => ({ label, total })).sort((a, b) => b.total - a.total),
    byAge: AGE_BANDS.flatMap((b) => (age.has(b.label) ? [{ label: b.label, total: age.get(b.label)! }] : [])),
    secondaryCauses: [...secondary]
      .map(([code, total]) => ({ code, total }))
      .sort((a, b) => b.total - a.total || a.code.localeCompare(b.code))
      .slice(0, limitSecondary),
  };
}

function where(f: DeathFilters): SQL {
  const column = f.basis === "residencia" ? trafficDeath.residenceCity : trafficDeath.occurrenceCity;
  return and(
    f.city !== undefined ? eq(column, f.city) : inArray(column, RMR_SIM_CODES),
    f.yearFrom !== undefined && f.yearTo !== undefined ? between(trafficDeath.year, f.yearFrom, f.yearTo) : undefined,
    f.places?.length ? inArray(trafficDeath.deathPlace, f.places) : undefined,
  )!;
}

export async function getDeathStats(db: Db, filters: DeathFilters): Promise<DeathStats> {
  const rows = await db
    .select({
      year: trafficDeath.year,
      cause: trafficDeath.cause,
      secondaryCauses: trafficDeath.secondaryCauses,
      sex: trafficDeath.sex,
      raceColor: trafficDeath.raceColor,
      ageYears: trafficDeath.ageYears,
    })
    .from(trafficDeath)
    .where(where(filters));
  return summarizeDeaths(rows);
}

export type DeathOverview = {
  years: number[];
  /** Um conjunto para cada olhar: onde morreram e onde moravam. */
  byBasis: Record<
    Basis,
    {
      byYear: { year: number; total: number }[];
      /** Município (código do SIM) -> óbitos por ano. */
      byCity: { city: number; name: string; total: number; years: Record<number, number> }[];
    }
  >;
  updatedThrough: number | null;
};

export async function getDeathOverview(db: Db): Promise<DeathOverview> {
  const rows = await db
    .select({
      year: trafficDeath.year,
      occurrence: trafficDeath.occurrenceCity,
      residence: trafficDeath.residenceCity,
      total: sql<number>`count(*)::int`,
    })
    .from(trafficDeath)
    .groupBy(trafficDeath.year, trafficDeath.occurrenceCity, trafficDeath.residenceCity);

  const rmr = new Set(RMR_SIM_CODES);
  const build = (pick: (r: (typeof rows)[number]) => number | null) => {
    const byYear = new Map<number, number>();
    const byCity = new Map<number, Record<number, number>>();
    for (const r of rows) {
      const city = pick(r);
      if (city === null || !rmr.has(city)) continue;
      byYear.set(r.year, (byYear.get(r.year) ?? 0) + r.total);
      const years = byCity.get(city) ?? {};
      years[r.year] = (years[r.year] ?? 0) + r.total;
      byCity.set(city, years);
    }
    return {
      byYear: [...byYear].map(([year, total]) => ({ year, total })).sort((a, b) => a.year - b.year),
      byCity: [...byCity]
        .map(([city, years]) => ({
          city,
          name: RMR_CITY_NAMES[city] ?? String(city),
          total: Object.values(years).reduce((a, b) => a + b, 0),
          years,
        }))
        .sort((a, b) => b.total - a.total),
    };
  };

  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  return {
    years,
    byBasis: { ocorrencia: build((r) => r.occurrence), residencia: build((r) => r.residence) },
    updatedThrough: years.at(-1) ?? null,
  };
}
