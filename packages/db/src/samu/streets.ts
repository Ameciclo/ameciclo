import { sql } from "drizzle-orm";

import type { Db } from "../index";
import { validOutcomeSql } from "./read";
import { MIN_RATE_CALLS, MIN_RATE_KM } from "./streets-model";

export { MIN_RATE_CALLS, MIN_RATE_KM };

// ---------------------------------------------------------------------------
// Vias inseguras: as vias do Recife com mais chamados do SAMU por sinistro de trânsito.
//
// Conta os chamados que tiveram atendimento (VALID_OUTCOMES) por logradouro (samu_call.street, o nome já
// corrigido pela Prefeitura) e junta a extensão e o traçado dos trechos da Prefeitura (street_segment) pelo nome.
// Só devolve contagens e geometrias de via: nenhum chamado individual sai daqui.
// ---------------------------------------------------------------------------

// Código IBGE do Recife.
export const RECIFE_IBGE = 2611606;

// Nomes do SAMU que são a mesma via que outro nome da Prefeitura (o SAMU escreve "Av. Sul"; a Prefeitura, "Av. Sul
// Gov. Cid Sampaio"). Chave e valor sem acento e em maiúsculas; o valor é um nome que existe em street_segment.
// Juntam-se as contagens dos dois nomes.
export const STREET_ALIASES: Record<string, string> = {
  "AV SUL": "AV SUL GOV. CID SAMPAIO",
  "AV NORTE": "AV NORTE MIGUEL ARRAES DE ALENCAR",
  "AV CONSELHEIRO AGUIAR": "AV CONS AGUIAR",
  "AV CONS ROSA E SILVA": "AV CONSELHEIRO ROSA E SILVA",
  "AVENIDA CELSO FURTADO (VIA MANGUE)": "AV CELSO FURTADO",
  "VIA MANGUE": "AV CELSO FURTADO",
  "CAIS DO APOLO": "C DO APOLO",
};

const aliasValues = () => sql.join(Object.entries(STREET_ALIASES).map(([from, to]) => sql`(${from}, ${to})`), sql`, `);

// Chamados com atendimento e via identificada, com a via já trocada pelo nome da Prefeitura quando há apelido.
// Alias `c` para a coluna `key` e `occurred_on`.
const callsSql = (city: number) => sql`
  select coalesce(a.to_key, upper(c.street)) as key, c.occurred_on, c.category
  from samu_call c
  left join (values ${aliasValues()}) as a(from_key, to_key) on a.from_key = upper(c.street)
  where c.city_ibge = ${city} and ${validOutcomeSql} and c.street is not null`;

export type UnsafeStreet = {
  rank: number;
  // Chave estável da via (nome da Prefeitura, sem acento, maiúsculas): é o que vai na URL.
  key: string;
  // Nome para mostrar: o oficial da Prefeitura quando a via casa com a malha; senão, o do SAMU.
  name: string;
  calls: number;
  // Soma dos trechos da Prefeitura com esse nome; null quando a via não casa com nenhum.
  lengthKm: number | null;
  // Chamados por km; null quando a via é curta ou tem poucos chamados (ver MIN_RATE_KM e MIN_RATE_CALLS).
  callsPerKm: number | null;
};

export type UnsafeStreetsYear = { year: number; calls: number; months: number };

export type UnsafeStreets = {
  // Chamados com atendimento em cada ano (months < 12: o ano ainda não fechou na fonte).
  years: UnsafeStreetsYear[];
  from: number;
  to: number;
  totalCalls: number;
  // Chamados em que o logradouro não foi identificado (não entram no ranking).
  unidentifiedCalls: number;
  // Logradouros distintos com pelo menos um chamado.
  streetCount: number;
  // Chamados cuja via casou com a malha da Prefeitura (para saber o quanto o km cobre).
  matchedCalls: number;
  streets: UnsafeStreet[];
};

export type UnsafeStreetsOptions = { cityIbge?: number; from?: number; to?: number; limit?: number };

type StreetRow = { key: string; name: string | null; calls: number; meters: number | null };

const toStreet = (r: StreetRow, i: number): UnsafeStreet => {
  const lengthKm = r.meters && r.meters > 0 ? r.meters / 1000 : null;
  const rated = lengthKm !== null && lengthKm >= MIN_RATE_KM && r.calls >= MIN_RATE_CALLS;
  return { rank: i + 1, key: r.key, name: r.name ?? r.key, calls: r.calls, lengthKm, callsPerKm: rated ? r.calls / lengthKm : null };
};

async function years(db: Db, city: number): Promise<UnsafeStreetsYear[]> {
  return (
    await db.execute<UnsafeStreetsYear>(sql`
      select extract(year from c.occurred_on)::int as year, count(*)::int as calls,
        count(distinct extract(month from c.occurred_on))::int as months
      from samu_call c
      where c.city_ibge = ${city} and ${validOutcomeSql}
      group by 1 order by 1`)
  ).rows;
}

export async function getUnsafeStreets(db: Db, options: UnsafeStreetsOptions = {}): Promise<UnsafeStreets> {
  const city = options.cityIbge ?? RECIFE_IBGE;
  const limit = Math.min(Math.max(options.limit ?? 150, 1), 500);

  const yearRows = await years(db, city);
  const first = yearRows[0]?.year ?? 0;
  const last = yearRows[yearRows.length - 1]?.year ?? 0;
  const from = Math.min(Math.max(options.from ?? first, first), last);
  const to = Math.max(Math.min(options.to ?? last, last), from);

  const [totals] = (
    await db.execute<{ total: number; unidentified: number; streets: number; matched: number }>(sql`
      select count(*)::int as total,
        (count(*) filter (where c.street is null))::int as unidentified,
        count(distinct coalesce(a.to_key, upper(c.street)))::int as streets,
        (count(*) filter (where exists (select 1 from street_segment s where s.name_key = coalesce(a.to_key, upper(c.street)))))::int as matched
      from samu_call c
      left join (values ${aliasValues()}) as a(from_key, to_key) on a.from_key = upper(c.street)
      where c.city_ibge = ${city} and ${validOutcomeSql}
        and extract(year from c.occurred_on) between ${from} and ${to}`)
  ).rows;

  const rows = (
    await db.execute<StreetRow>(sql`
      with calls as (${callsSql(city)}),
      per_street as (
        select key, count(*)::int as calls
        from calls
        where extract(year from occurred_on) between ${from} and ${to}
        group by key
        order by calls desc, key
        limit ${limit}
      )
      select p.key, p.calls,
        (select max(s.official_name) from street_segment s where s.name_key = p.key) as name,
        (select sum(s.length_m) from street_segment s where s.name_key = p.key) as meters
      from per_street p
      order by p.calls desc, p.key`)
  ).rows;

  return {
    years: yearRows,
    from,
    to,
    totalCalls: totals?.total ?? 0,
    unidentifiedCalls: totals?.unidentified ?? 0,
    streetCount: totals?.streets ?? 0,
    matchedCalls: totals?.matched ?? 0,
    streets: rows.map(toStreet),
  };
}

export type StreetGeometry = { key: string; geometry: { type: "MultiLineString"; coordinates: number[][][] } };

// O traçado de cada via pedida (os trechos juntos, levemente simplificados para o mapa). Vias sem casamento ficam de fora.
export async function getStreetGeometries(db: Db, keys: string[]): Promise<StreetGeometry[]> {
  if (keys.length === 0) return [];
  const result = await db.execute<StreetGeometry>(sql`
    select s.name_key as key,
      ST_AsGeoJSON(ST_CollectionExtract(ST_Collect(ST_SimplifyPreserveTopology(s.geom, 0.00003)), 2), 5)::json as geometry
    from street_segment s
    where s.name_key in (${sql.join(keys.map((k) => sql`${k}`), sql`, `)})
    group by s.name_key`);
  return result.rows;
}

export type StreetCategoryRow = { category: string; calls: number };

export type StreetDetail = {
  street: UnsafeStreet;
  // Posição entre todas as vias do Recife, no período completo da série.
  rankOverall: number;
  years: UnsafeStreetsYear[];
  categories: StreetCategoryRow[];
};

// Uma via: chamados por ano e por tipo de ocorrência (acidente de moto, atropelamento...), e a posição dela no ranking.
export async function getStreetDetail(db: Db, key: string, options: { cityIbge?: number } = {}): Promise<StreetDetail | null> {
  const city = options.cityIbge ?? RECIFE_IBGE;
  const [head] = (
    await db.execute<StreetRow & { rank: number }>(sql`
      with calls as (${callsSql(city)}),
      per_street as (select key, count(*)::int as calls from calls group by key),
      ranked as (select key, calls, rank() over (order by calls desc)::int as rank from per_street)
      select r.key, r.calls, r.rank,
        (select max(s.official_name) from street_segment s where s.name_key = r.key) as name,
        (select sum(s.length_m) from street_segment s where s.name_key = r.key) as meters
      from ranked r where r.key = ${key}`)
  ).rows;
  if (!head) return null;
  // Meses com chamado em cada ano (de todo o Recife): diz se o ano ainda não fechou na fonte.
  const monthsOf = new Map((await years(db, city)).map((y) => [y.year, y.months]));
  const byYear = (
    await db.execute<{ year: number; calls: number }>(sql`
      with calls as (${callsSql(city)})
      select extract(year from occurred_on)::int as year, count(*)::int as calls
      from calls where key = ${key} group by 1 order by 1`)
  ).rows.map((y) => ({ ...y, months: monthsOf.get(y.year) ?? 12 }));
  const categories = (
    await db.execute<StreetCategoryRow>(sql`
      with calls as (${callsSql(city)})
      select category, count(*)::int as calls from calls where key = ${key} group by 1 order by 2 desc`)
  ).rows;
  return { street: toStreet(head, head.rank - 1), rankOverall: head.rank, years: byYear, categories };
}

// Todas as vias com chamado, para achar uma pela URL ou pela busca (chave e nome para mostrar).
export async function listStreetNames(db: Db, options: { cityIbge?: number } = {}): Promise<{ key: string; name: string; calls: number }[]> {
  const city = options.cityIbge ?? RECIFE_IBGE;
  return (
    await db.execute<{ key: string; name: string; calls: number }>(sql`
      with calls as (${callsSql(city)})
      select key, coalesce((select max(s.official_name) from street_segment s where s.name_key = calls.key), key) as name, count(*)::int as calls
      from calls group by key order by calls desc, key`)
  ).rows;
}
