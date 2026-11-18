import { sql } from "drizzle-orm";

import type { Db } from "../index";
import { validOutcomeSql } from "./read";

// ---------------------------------------------------------------------------
// Vias inseguras: as vias do Recife com mais chamados do SAMU por sinistro de trânsito.
//
// Conta os chamados que tiveram atendimento (VALID_OUTCOMES) por logradouro (samu_call.street, o nome já
// corrigido pela Prefeitura) e junta a extensão e o traçado dos trechos da Prefeitura (street_segment) pelo nome.
// Só devolve contagens e geometrias de via: nenhum chamado individual sai daqui.
// ---------------------------------------------------------------------------

// Código IBGE do Recife.
export const RECIFE_IBGE = 2611606;

export type UnsafeStreet = {
  rank: number;
  street: string;
  calls: number;
  // Soma dos trechos da Prefeitura com esse nome; null quando o nome não casa com nenhum.
  lengthKm: number | null;
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

export async function getUnsafeStreets(db: Db, options: UnsafeStreetsOptions = {}): Promise<UnsafeStreets> {
  const city = options.cityIbge ?? RECIFE_IBGE;
  const limit = Math.min(Math.max(options.limit ?? 150, 1), 500);

  const years = (
    await db.execute<UnsafeStreetsYear>(sql`
      select extract(year from c.occurred_on)::int as year, count(*)::int as calls,
        count(distinct extract(month from c.occurred_on))::int as months
      from samu_call c
      where c.city_ibge = ${city} and ${validOutcomeSql}
      group by 1 order by 1`)
  ).rows;
  const first = years[0]?.year ?? 0;
  const last = years[years.length - 1]?.year ?? 0;
  const from = Math.max(options.from ?? first, first);
  const to = Math.min(options.to ?? last, last);

  const [totals] = (
    await db.execute<{ total: number; unidentified: number; streets: number; matched: number }>(sql`
      select count(*)::int as total,
        (count(*) filter (where c.street is null))::int as unidentified,
        count(distinct c.street)::int as streets,
        (count(*) filter (where exists (select 1 from street_segment s where s.name_key = upper(c.street))))::int as matched
      from samu_call c
      where c.city_ibge = ${city} and ${validOutcomeSql}
        and extract(year from c.occurred_on) between ${from} and ${to}`)
  ).rows;

  const rows = (
    await db.execute<{ street: string; calls: number; meters: number | null }>(sql`
      with per_street as (
        select c.street, count(*)::int as calls
        from samu_call c
        where c.city_ibge = ${city} and ${validOutcomeSql} and c.street is not null
          and extract(year from c.occurred_on) between ${from} and ${to}
        group by c.street
        order by calls desc, c.street
        limit ${limit}
      )
      select p.street, p.calls,
        (select sum(s.length_m) from street_segment s where s.name_key = upper(p.street)) as meters
      from per_street p
      order by p.calls desc, p.street`)
  ).rows;

  return {
    years,
    from,
    to,
    totalCalls: totals?.total ?? 0,
    unidentifiedCalls: totals?.unidentified ?? 0,
    streetCount: totals?.streets ?? 0,
    matchedCalls: totals?.matched ?? 0,
    streets: rows.map((r, i) => {
      const lengthKm = r.meters && r.meters > 0 ? r.meters / 1000 : null;
      return { rank: i + 1, street: r.street, calls: r.calls, lengthKm, callsPerKm: lengthKm ? r.calls / lengthKm : null };
    }),
  };
}

export type StreetGeometry = { street: string; geometry: { type: "MultiLineString"; coordinates: number[][][] } };

// O traçado de cada via pedida (os trechos juntos, levemente simplificados para o mapa). Vias sem casamento ficam de fora.
export async function getStreetGeometries(db: Db, streets: string[]): Promise<StreetGeometry[]> {
  if (streets.length === 0) return [];
  const keys = streets.map((s) => s.toUpperCase());
  const result = await db.execute<{ key: string; geometry: StreetGeometry["geometry"] }>(sql`
    select s.name_key as key,
      ST_AsGeoJSON(ST_CollectionExtract(ST_Collect(ST_SimplifyPreserveTopology(s.geom, 0.00003)), 2), 5)::json as geometry
    from street_segment s
    where s.name_key in (${sql.join(keys.map((k) => sql`${k}`), sql`, `)})
    group by s.name_key`);
  const byKey = new Map(result.rows.map((r) => [r.key, r.geometry]));
  return streets.flatMap((street) => {
    const geometry = byKey.get(street.toUpperCase());
    return geometry ? [{ street, geometry }] : [];
  });
}
