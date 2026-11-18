import { sql } from "drizzle-orm";

import { getCountLocations } from "./ciclodados";
import type { Db } from "./index";
import { validOutcomeSql } from "./samu/read";
import { RECIFE_IBGE } from "./samu/streets";

// ---------------------------------------------------------------------------
// CicloDados: o resumo de um ponto clicado no mapa (a rua mais próxima, o que há em volta e o que as pessoas dizem).
// Era o `/v1/nearby` do Atlas; agora sai das tabelas do banco. Só agregados: nenhuma pessoa, chamado ou entrevista.
// ---------------------------------------------------------------------------

export type PointInfo = {
  location: {
    lat: number;
    lng: number;
    nearest_street: { name: string; official_name: string; total_length_meters: number; distance_to_point_meters: number };
  };
  emergency_calls: {
    annual_history: { year: number; total_calls: number }[];
    last_month_data: { month: string; total_calls: number };
    by_category: { category: string; count: number }[];
    by_gender: { gender: string | null; count: number }[];
    by_age_group: { age_group: string; count: number }[];
  };
  bike_racks: {
    total: number;
    total_capacity: number;
    items: { id: number; name: string; capacity: string; type: string; lat: number; lng: number; distance_meters: number }[];
  };
  cyclist_counts: {
    counts: {
      id: number;
      name: string;
      date: string;
      city: string;
      total_cyclists: number;
      distance_meters: number;
      characteristics: Record<string, number>;
    }[];
  };
  shared_bike: { has_stations: boolean; stations: { id: number; name: string; capacity: number; distance_meters: number }[] };
  cycling_infra: {
    existing: { type: string; name: string; distance_meters: number }[];
    planned_pdc: { id: number; pdc_ref: string; typology: string; name: string; pdc_stretch: string; pdc_cities: string; pdc_km: number }[];
  };
  cyclist_profile: {
    total_profiles: number;
    by_edition: {
      edition: string;
      total_profiles: number;
      race_distribution: Record<string, number>;
      gender_distribution: Record<string, number>;
      age_distribution: Record<string, number>;
      education_distribution: Record<string, number>;
      income_distribution: Record<string, number>;
    }[];
  };
};

// Distância em metros entre dois pontos (haversine): para as contagens, que não têm geometria no banco.
function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

const toNumber = (v: number | string | null | undefined) => (v === null || v === undefined ? 0 : Number(v));

// Abre uma conexão, roda `fn` nela e a fecha. Cada consulta abaixo usa a sua, em paralelo: o tempo do resumo é o da mais lenta,
// não a soma de todas (cada ida ao banco custa uma viagem de rede, e eram ~20 em sequência).
export type RunWithDb = <T>(fn: (db: Db) => Promise<T>) => Promise<T>;

type Json<T> = T | null;

export async function getPointInfo(run: RunWithDb, options: { lat: number; lng: number; radius?: number }): Promise<PointInfo> {
  const { lat, lng } = options;
  const radius = Math.min(Math.max(options.radius ?? 200, 50), 1000);
  const here = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

  // 1. A rua mais próxima (malha da Prefeitura), a extensão dela e os chamados do SAMU nela: uma consulta só.
  const streetAndCalls = run(async (db) => {
    const [row] = (
      await db.execute<{
        street: Json<{ key: string; official: string | null; distance: number }>;
        length: Json<number>;
        annual: { year: number; total_calls: number }[];
        last_month: Json<{ month: string; total_calls: number }>;
        by_category: { category: string; count: number }[];
        by_gender: { gender: string | null; count: number }[];
        by_age: { age_group: string; count: number }[];
      }>(sql`
        with st as (
          select s.name_key as key, s.official_name as official, ST_Distance(s.geom::geography, ${here}::geography) as distance
          from street_segment s order by s.geom <-> ${here} limit 1
        ),
        calls as (
          select c.occurred_on, c.category, c.gender, c.age
          from samu_call c
          where c.city_ibge = ${RECIFE_IBGE} and ${validOutcomeSql} and upper(c.street) = (select key from st)
        )
        select
          (select row_to_json(st) from st) as street,
          (select sum(length_m) from street_segment where name_key = (select key from st)) as length,
          (select coalesce(json_agg(x order by x.year desc), '[]'::json)
             from (select extract(year from occurred_on)::int as year, count(*)::int as total_calls from calls group by 1) x) as annual,
          (select row_to_json(y)
             from (select to_char(occurred_on, 'YYYY-MM') as month, count(*)::int as total_calls from calls group by 1 order by 1 desc limit 1) y) as last_month,
          (select coalesce(json_agg(z order by z.count desc), '[]'::json)
             from (select category, count(*)::int as count from calls group by 1) z) as by_category,
          (select coalesce(json_agg(z order by z.count desc), '[]'::json)
             from (select gender, count(*)::int as count from calls group by 1) z) as by_gender,
          (select coalesce(json_agg(z order by z.count desc), '[]'::json)
             from (select case when age is null then 'Não informado' when age < 18 then 'Menor de 18' when age <= 30 then '18-30'
                              when age <= 50 then '31-50' when age <= 70 then '51-70' else 'Maior de 70' end as age_group,
                          count(*)::int as count from calls group by 1) z) as by_age`)
    ).rows;
    return row;
  });

  // 2. O que há em volta: bicicletários, estações de Bike PE, infraestrutura existente e projetos do PDC.
  const around = run(async (db) => {
    const [row] = (
      await db.execute<{
        racks: { id: number; name: string | null; capacity: number | null; parking_type: string | null; lat: number; lng: number; distance: number }[];
        stations: { id: number; name: string | null; capacity: number | null; distance: number }[];
        existing: { type: string; name: string | null; distance: number }[];
        planned: { id: number; ref: string; typology: string; name: string; stretch: string | null; km: number | string | null }[];
      }>(sql`
        select
          (select coalesce(json_agg(r order by r.distance), '[]'::json) from (
             select id, name, capacity, parking_type, ST_Y(geom) as lat, ST_X(geom) as lng, ST_Distance(geom::geography, ${here}::geography) as distance
             from bicycle_rack where ST_DWithin(geom::geography, ${here}::geography, ${radius})) r) as racks,
          (select coalesce(json_agg(r order by r.distance), '[]'::json) from (
             select id, name, capacity, ST_Distance(geom::geography, ${here}::geography) as distance
             from bike_share_station where ST_DWithin(geom::geography, ${here}::geography, 2000) order by distance limit 10) r) as stations,
          (select coalesce(json_agg(r order by r.distance), '[]'::json) from (
             select t.label as type, w.name, min(ST_Distance(w.geom::geography, ${here}::geography)) as distance
             from cycling_way w join cycling_typology t on t.key = w.built_typology_key
             where ST_DWithin(w.geom::geography, ${here}::geography, ${radius * 1.5})
             group by t.label, w.name order by distance limit 10) r) as existing,
          (select coalesce(json_agg(r order by r.ref), '[]'::json) from (
             select distinct pr.id, pr.ref, t.label as typology, pr.name, pr.stretch, pr.planned_km as km
             from cycling_way w
             join cycling_way_project wp on wp.way_id = w.id
             join cycling_pdc_project pr on pr.id = wp.project_id
             join cycling_typology t on t.key = pr.typology_key
             where ST_DWithin(w.geom::geography, ${here}::geography, ${radius * 1.5}) limit 10) r) as planned`)
    ).rows;
    return row;
  });

  // 3. A pesquisa de perfil nos pontos de entrevista a até `radius` metros, por edição (ano).
  const profile = run(async (db) => {
    const [row] = (
      await db.execute<{
        totals: { year: number; total: number }[];
        answers: { year: number; question: string; label: string; n: number }[];
      }>(sql`
        with near as (
          select i.*, s.year
          from profile_interview i
          join profile_survey s on s.id = i.survey_id
          join profile_point p on p.id = i.point_id
          where ST_DWithin(ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography, ${here}::geography, ${radius})
        )
        select
          (select coalesce(json_agg(t order by t.year), '[]'::json) from (select year, count(*)::int as total from near group by 1) t) as totals,
          (select coalesce(json_agg(a), '[]'::json) from (
             select n.year, q.question, o.label, count(*)::int as n
             from near n
             join lateral (values ('race', n.color_race_id), ('gender', n.gender_id), ('age', n.age_group_id),
                                  ('education', n.schooling_id), ('income', n.income_id)) as q(question, option_id) on q.option_id is not null
             join profile_option o on o.id = q.option_id
             group by n.year, q.question, o.label) a) as answers`)
    ).rows;
    return row;
  });

  // 4. As contagens da Ameciclo, as mais próximas (as contagens não têm geometria no banco: a distância é calculada aqui).
  const countsNear = run(async (db) =>
    (await getCountLocations(db))
      .flatMap((l) => {
        if (l.latitude === null || l.longitude === null) return [];
        const distance = metersBetween(lat, lng, l.latitude, l.longitude);
        return distance <= radius * 2 ? l.counts.map((c) => ({ l, c, distance })) : [];
      })
      .sort((a, b) => a.distance - b.distance || b.c.date.localeCompare(a.c.date))
      .slice(0, 5),
  );

  const [sc, ar, pf, nearCounts] = await Promise.all([streetAndCalls, around, profile, countsNear]);
  const street = sc?.street ?? null;

  return {
    location: {
      lat,
      lng,
      nearest_street: {
        name: street?.key ?? "",
        official_name: street?.official ?? "",
        total_length_meters: toNumber(sc?.length),
        distance_to_point_meters: Math.round(toNumber(street?.distance)),
      },
    },
    emergency_calls: {
      annual_history: sc?.annual ?? [],
      last_month_data: sc?.last_month ?? { month: "", total_calls: 0 },
      by_category: sc?.by_category ?? [],
      by_gender: sc?.by_gender ?? [],
      by_age_group: sc?.by_age ?? [],
    },
    bike_racks: {
      total: ar.racks.length,
      total_capacity: ar.racks.reduce((sum, r) => sum + (r.capacity ?? 0), 0),
      items: ar.racks.slice(0, 10).map((r) => ({
        id: r.id,
        name: r.name ?? "Bicicletário",
        capacity: r.capacity === null ? "Não informada" : String(r.capacity),
        type: r.parking_type ?? "Não informado",
        lat: r.lat,
        lng: r.lng,
        distance_meters: Math.round(r.distance),
      })),
    },
    cyclist_counts: {
      counts: nearCounts.map(({ l, c, distance }) => ({
        id: c.id,
        name: l.name,
        date: c.date,
        city: "",
        total_cyclists: c.total_cyclists,
        distance_meters: Math.round(distance),
        characteristics: { ...c.characteristics },
      })),
    },
    shared_bike: {
      has_stations: ar.stations.length > 0,
      stations: ar.stations.map((s) => ({ id: s.id, name: s.name ?? "Estação Bike PE", capacity: s.capacity ?? 0, distance_meters: Math.round(s.distance) })),
    },
    cycling_infra: {
      existing: ar.existing.map((e) => ({ type: e.type, name: e.name ?? "Sem nome", distance_meters: Math.round(e.distance) })),
      planned_pdc: ar.planned.map((p) => ({ id: p.id, pdc_ref: p.ref, typology: p.typology, name: p.name, pdc_stretch: p.stretch ?? "", pdc_cities: "", pdc_km: toNumber(p.km) })),
    },
    cyclist_profile: {
      total_profiles: pf.totals.reduce((sum, e) => sum + e.total, 0),
      by_edition: pf.totals.map((e) => {
        const distribution = (question: string) =>
          Object.fromEntries(pf.answers.filter((a) => a.year === e.year && a.question === question).map((a) => [a.label, a.n]));
        return {
          edition: String(e.year),
          total_profiles: e.total,
          race_distribution: distribution("race"),
          gender_distribution: distribution("gender"),
          age_distribution: distribution("age"),
          education_distribution: distribution("education"),
          income_distribution: distribution("income"),
        };
      }),
    },
  };
}
