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

export async function getPointInfo(db: Db, options: { lat: number; lng: number; radius?: number }): Promise<PointInfo> {
  const { lat, lng } = options;
  const radius = Math.min(Math.max(options.radius ?? 200, 50), 1000);
  const here = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

  // 1. A rua mais próxima (da malha da Prefeitura) e a extensão dela.
  const [street] = (
    await db.execute<{ key: string; official: string | null; distance: number }>(sql`
      select s.name_key as key, s.official_name as official, ST_Distance(s.geom::geography, ${here}::geography) as distance
      from street_segment s order by s.geom <-> ${here} limit 1`)
  ).rows;
  const [length] = street
    ? (await db.execute<{ meters: number | null }>(sql`select sum(length_m) as meters from street_segment where name_key = ${street.key}`)).rows
    : [];

  // 2. Chamados do SAMU nessa rua: por ano, no último mês, por tipo, sexo e idade.
  const calls = (suffix: ReturnType<typeof sql>) =>
    sql`from samu_call c where c.city_ibge = ${RECIFE_IBGE} and ${validOutcomeSql} and ${street ? sql`upper(c.street) = ${street.key}` : sql`false`} ${suffix}`;
  const annual = (await db.execute<{ year: number; total_calls: number }>(sql`select extract(year from c.occurred_on)::int as year, count(*)::int as total_calls ${calls(sql`group by 1 order by 1 desc`)}`)).rows;
  const [lastMonth] = (await db.execute<{ month: string; total_calls: number }>(sql`select to_char(c.occurred_on, 'YYYY-MM') as month, count(*)::int as total_calls ${calls(sql`group by 1 order by 1 desc limit 1`)}`)).rows;
  const byCategory = (await db.execute<{ category: string; count: number }>(sql`select c.category, count(*)::int as count ${calls(sql`group by 1 order by 2 desc`)}`)).rows;
  const byGender = (await db.execute<{ gender: string | null; count: number }>(sql`select c.gender, count(*)::int as count ${calls(sql`group by 1 order by 2 desc`)}`)).rows;
  const byAge = (
    await db.execute<{ age_group: string; count: number }>(sql`
      select case when c.age is null then 'Não informado' when c.age < 18 then 'Menor de 18' when c.age <= 30 then '18-30'
                  when c.age <= 50 then '31-50' when c.age <= 70 then '51-70' else 'Maior de 70' end as age_group,
             count(*)::int as count ${calls(sql`group by 1 order by 2 desc`)}`)
  ).rows;

  // 3. Bicicletários num raio de `radius` metros.
  const racks = (
    await db.execute<{ id: number; name: string | null; capacity: number | null; parking_type: string | null; lat: number; lng: number; distance: number }>(sql`
      select r.id, r.name, r.capacity, r.parking_type, ST_Y(r.geom) as lat, ST_X(r.geom) as lng, ST_Distance(r.geom::geography, ${here}::geography) as distance
      from bicycle_rack r where ST_DWithin(r.geom::geography, ${here}::geography, ${radius}) order by distance`)
  ).rows;

  // 4. Contagens num raio de 2x (as contagens são esparsas): as 5 mais próximas, com as características.
  const nearCounts = (await getCountLocations(db))
    .flatMap((l) => {
      if (l.latitude === null || l.longitude === null) return [];
      const distance = metersBetween(lat, lng, l.latitude, l.longitude);
      return distance <= radius * 2 ? l.counts.map((c) => ({ l, c, distance })) : [];
    })
    .sort((a, b) => a.distance - b.distance || b.c.date.localeCompare(a.c.date))
    .slice(0, 5);

  // 5. Estações de Bike PE em 2 km.
  const stations = (
    await db.execute<{ id: number; name: string | null; capacity: number | null; distance: number }>(sql`
      select s.id, s.name, s.capacity, ST_Distance(s.geom::geography, ${here}::geography) as distance
      from bike_share_station s where ST_DWithin(s.geom::geography, ${here}::geography, 2000) order by distance limit 10`)
  ).rows;

  // 6. Infraestrutura existente (1,5x o raio) e projetos do PDC que passam por perto.
  const existing = (
    await db.execute<{ type: string; name: string | null; distance: number }>(sql`
      select t.label as type, w.name, min(ST_Distance(w.geom::geography, ${here}::geography)) as distance
      from cycling_way w join cycling_typology t on t.key = w.built_typology_key
      where ST_DWithin(w.geom::geography, ${here}::geography, ${radius * 1.5})
      group by t.label, w.name order by distance limit 10`)
  ).rows;
  const planned = (
    await db.execute<{ id: number; ref: string; typology: string; name: string; stretch: string | null; km: string | number | null }>(sql`
      select distinct pr.id, pr.ref, t.label as typology, pr.name, pr.stretch, pr.planned_km as km
      from cycling_way w
      join cycling_way_project wp on wp.way_id = w.id
      join cycling_pdc_project pr on pr.id = wp.project_id
      join cycling_typology t on t.key = pr.typology_key
      where ST_DWithin(w.geom::geography, ${here}::geography, ${radius * 1.5})
      order by pr.ref limit 10`)
  ).rows;

  // 7. Pesquisa de perfil nos pontos de entrevista num raio de `radius` metros, por edição (ano).
  const editionTotals = (
    await db.execute<{ year: number; total: number }>(sql`
      select s.year, count(*)::int as total
      from profile_interview i join profile_survey s on s.id = i.survey_id join profile_point p on p.id = i.point_id
      where ST_DWithin(ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography, ${here}::geography, ${radius})
      group by s.year order by s.year`)
  ).rows;
  const answers =
    editionTotals.length === 0
      ? []
      : (
          await db.execute<{ year: number; question: string; label: string; n: number }>(sql`
            select s.year, q.question, o.label, count(*)::int as n
            from profile_interview i
            join profile_survey s on s.id = i.survey_id
            join profile_point p on p.id = i.point_id
            join lateral (values ('race', i.color_race_id), ('gender', i.gender_id), ('age', i.age_group_id),
                                 ('education', i.schooling_id), ('income', i.income_id)) as q(question, option_id) on q.option_id is not null
            join profile_option o on o.id = q.option_id
            where ST_DWithin(ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography, ${here}::geography, ${radius})
            group by s.year, q.question, o.label`)
        ).rows;
  const distribution = (year: number, question: string) =>
    Object.fromEntries(answers.filter((a) => a.year === year && a.question === question).map((a) => [a.label, a.n]));

  return {
    location: {
      lat,
      lng,
      nearest_street: {
        name: street?.key ?? "",
        official_name: street?.official ?? "",
        total_length_meters: toNumber(length?.meters),
        distance_to_point_meters: Math.round(toNumber(street?.distance)),
      },
    },
    emergency_calls: {
      annual_history: annual,
      last_month_data: lastMonth ?? { month: "", total_calls: 0 },
      by_category: byCategory,
      by_gender: byGender,
      by_age_group: byAge,
    },
    bike_racks: {
      total: racks.length,
      total_capacity: racks.reduce((sum, r) => sum + (r.capacity ?? 0), 0),
      items: racks.slice(0, 10).map((r) => ({
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
      has_stations: stations.length > 0,
      stations: stations.map((s) => ({ id: s.id, name: s.name ?? "Estação Bike PE", capacity: s.capacity ?? 0, distance_meters: Math.round(s.distance) })),
    },
    cycling_infra: {
      existing: existing.map((e) => ({ type: e.type, name: e.name ?? "Sem nome", distance_meters: Math.round(e.distance) })),
      planned_pdc: planned.map((p) => ({ id: p.id, pdc_ref: p.ref, typology: p.typology, name: p.name, pdc_stretch: p.stretch ?? "", pdc_cities: "", pdc_km: toNumber(p.km) })),
    },
    cyclist_profile: {
      total_profiles: editionTotals.reduce((sum, e) => sum + e.total, 0),
      by_edition: editionTotals.map((e) => ({
        edition: String(e.year),
        total_profiles: e.total,
        race_distribution: distribution(e.year, "race"),
        gender_distribution: distribution(e.year, "gender"),
        age_distribution: distribution(e.year, "age"),
        education_distribution: distribution(e.year, "education"),
        income_distribution: distribution(e.year, "income"),
      })),
    },
  };
}
