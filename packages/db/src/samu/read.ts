import { sql } from "drizzle-orm";

import type { Db } from "../index";

// Desfechos que contam nas estatísticas: houve atendimento ou remoção. Os demais
// (desistência, trote, casa fechada, recusa, duplicado) são chamados que não
// chegaram a ser um paciente atendido.
export const VALID_OUTCOMES = [
  "Atendimento Concluído com Êxito",
  "Removido pelos Bombeiros/CIODS",
  "Removido por Particulares",
  "Óbito no Local/Atendimento",
] as const;

// Condição SQL para `samu_call` com alias `c`.
export const validOutcomeSql = sql.raw(`c.outcome in (${VALID_OUTCOMES.map((o) => `'${o}'`).join(", ")})`);

// ---------------------------------------------------------------------------
// Reads. Every query groups and counts: no call is ever returned. `Db` is the
// app's drizzle client; the statistics only count calls with a valid outcome
// unless said otherwise.
// ---------------------------------------------------------------------------

export type SamuYearRow = { year: number; received: number; valid: number };

export type SamuCityRow = {
  ibge: number;
  name: string;
  isRmr: boolean;
  total: number;
  // Valid calls per year.
  byYear: Record<number, number>;
};

export type SamuSummary = {
  // Date of the latest call (YYYY-MM-DD): the last year is usually partial.
  until: string | null;
  years: SamuYearRow[];
  cities: SamuCityRow[];
};

export async function getSamuSummary(db: Db): Promise<SamuSummary> {
  const years = await db.execute<SamuYearRow>(sql`
    select extract(year from c.occurred_on)::int as year,
      count(*)::int as received,
      (count(*) filter (where ${validOutcomeSql}))::int as valid
    from samu_call c
    group by 1 order by 1`);
  const [latest] = (await db.execute<{ until: string | null }>(sql`select max(occurred_on)::text as until from samu_call`)).rows;
  const cityYears = await db.execute<{ ibge: number; name: string; isRmr: boolean; year: number; n: number }>(sql`
    select s.ibge_code as ibge, s.name, s.is_rmr as "isRmr",
      extract(year from c.occurred_on)::int as year, count(*)::int as n
    from samu_call c
    join samu_city s on s.ibge_code = c.city_ibge
    where ${validOutcomeSql}
    group by 1, 2, 3, 4`);

  const cities = new Map<number, SamuCityRow>();
  for (const r of cityYears.rows) {
    const city = cities.get(r.ibge) ?? { ibge: r.ibge, name: r.name, isRmr: r.isRmr, total: 0, byYear: {} };
    city.byYear[r.year] = r.n;
    city.total += r.n;
    cities.set(r.ibge, city);
  }
  return { until: latest?.until ?? null, years: years.rows, cities: [...cities.values()].sort((a, b) => b.total - a.total) };
}

export type SamuFilter = {
  // All of Pernambuco when empty.
  cityIbge?: number | null;
  fromYear?: number | null;
  toYear?: number | null;
};

export type SamuCount = { label: string; n: number };

export type SamuProfile = {
  // Calls with a valid outcome in the filter.
  total: number;
  // Calls received, valid or not.
  received: number;
  categories: SamuCount[];
  gender: SamuCount[];
  ageGroups: SamuCount[];
  // Every outcome, so the share that was not a patient is visible.
  outcomes: (SamuCount & { valid: boolean })[];
};

function where(filter: SamuFilter) {
  const parts = [sql`true`];
  if (filter.cityIbge) parts.push(sql`c.city_ibge = ${filter.cityIbge}`);
  if (filter.fromYear) parts.push(sql`extract(year from c.occurred_on) >= ${filter.fromYear}`);
  if (filter.toYear) parts.push(sql`extract(year from c.occurred_on) <= ${filter.toYear}`);
  return sql.join(parts, sql` and `);
}

// The age groups, in order. Calls without an age are counted under "Não informada".
const AGE_GROUPS = ["Até 14", "15 a 24", "25 a 34", "35 a 44", "45 a 54", "55 a 64", "65 ou mais", "Não informada"];

export async function getSamuProfile(db: Db, filter: SamuFilter = {}): Promise<SamuProfile> {
  const w = where(filter);
  const count = async (label: ReturnType<typeof sql>, valid: boolean) =>
    (
      await db.execute<SamuCount>(sql`
        select ${label} as label, count(*)::int as n
        from samu_call c
        where ${w} ${valid ? sql`and ${validOutcomeSql}` : sql``}
        group by 1 order by n desc`)
    ).rows;

  const [categories, gender, ages, outcomes] = await Promise.all([
    count(sql`c.category`, true),
    count(sql`coalesce(c.gender, 'Não informado')`, true),
    count(
      sql`case when c.age is null then 'Não informada' when c.age <= 14 then 'Até 14' when c.age <= 24 then '15 a 24'
        when c.age <= 34 then '25 a 34' when c.age <= 44 then '35 a 44' when c.age <= 54 then '45 a 54'
        when c.age <= 64 then '55 a 64' else '65 ou mais' end`,
      true,
    ),
    count(sql`coalesce(c.outcome, 'Sem desfecho')`, false),
  ]);

  const valid = new Set<string>(VALID_OUTCOMES);
  return {
    total: categories.reduce((sum, r) => sum + r.n, 0),
    received: outcomes.reduce((sum, r) => sum + r.n, 0),
    categories,
    gender,
    ageGroups: AGE_GROUPS.map((label) => ages.find((r) => r.label === label) ?? { label, n: 0 }),
    outcomes: outcomes.map((r) => ({ ...r, valid: valid.has(r.label) })),
  };
}

export type SamuStreetRow = { street: string; n: number; byCategory: Record<string, number> };

// The streets with the most calls in a city; calls without an identified street are left out.
export async function listSamuStreets(db: Db, filter: SamuFilter, limit = 50): Promise<SamuStreetRow[]> {
  const result = await db.execute<{ street: string; category: string; n: number }>(sql`
    with top as (
      select c.street, count(*) as n
      from samu_call c
      where ${where(filter)} and ${validOutcomeSql} and c.street is not null
      group by 1 order by n desc, c.street limit ${limit}
    )
    select c.street, c.category, count(*)::int as n
    from samu_call c join top t on t.street = c.street
    where ${where(filter)} and ${validOutcomeSql}
    group by 1, 2`);

  const streets = new Map<string, SamuStreetRow>();
  for (const r of result.rows) {
    const row = streets.get(r.street) ?? { street: r.street, n: 0, byCategory: {} };
    row.byCategory[r.category] = r.n;
    row.n += r.n;
    streets.set(r.street, row);
  }
  return [...streets.values()].sort((a, b) => b.n - a.n || a.street.localeCompare(b.street));
}

export type SamuEvolutionRow = {
  year: number;
  concluded: number;
  removedByFirefighters: number;
  removedByPrivate: number;
  deathOnSite: number;
};

const EVOLUTION_KEY = {
  "Atendimento Concluído com Êxito": "concluded",
  "Removido pelos Bombeiros/CIODS": "removedByFirefighters",
  "Removido por Particulares": "removedByPrivate",
  "Óbito no Local/Atendimento": "deathOnSite",
} as const satisfies Record<(typeof VALID_OUTCOMES)[number], keyof Omit<SamuEvolutionRow, "year">>;

// Calls with a valid outcome per year, split by what happened to the patient.
export async function getSamuEvolution(db: Db, cityIbge?: number | null): Promise<SamuEvolutionRow[]> {
  const result = await db.execute<{ year: number; outcome: string; n: number }>(sql`
    select extract(year from c.occurred_on)::int as year, c.outcome, count(*)::int as n
    from samu_call c
    where ${where({ cityIbge })} and ${validOutcomeSql}
    group by 1, 2 order by 1`);

  const years = new Map<number, SamuEvolutionRow>();
  for (const r of result.rows) {
    const row = years.get(r.year) ?? {
      year: r.year,
      concluded: 0,
      removedByFirefighters: 0,
      removedByPrivate: 0,
      deathOnSite: 0,
    };
    for (const outcome of VALID_OUTCOMES) if (outcome === r.outcome) row[EVOLUTION_KEY[outcome]] = r.n;
    years.set(r.year, row);
  }
  return [...years.values()];
}
