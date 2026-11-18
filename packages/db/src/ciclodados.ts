import { sql } from "drizzle-orm";

import type { Db } from "./index";
import { loadPublicLocations, type PublicCharacteristics } from "./public";

// ---------------------------------------------------------------------------
// CicloDados: o que o painel do mapa lê do banco (antes vinha do Atlas).
//
// As camadas (infraestrutura e execução do PDC, pesquisa de perfil) e o resumo de um ponto clicado no mapa. Só devolve
// agregados e geometrias de via; nenhuma entrevista, chamado ou contagem individual sai daqui.
// ---------------------------------------------------------------------------

// ---- Infraestrutura e execução do PDC (mesma geometria, duas leituras) ---------------------------------------------

export type LineGeometry = { type: "LineString"; coordinates: number[][] } | { type: "MultiLineString"; coordinates: number[][][] };

export type CyclingMapGeojson = {
  type: "FeatureCollection";
  // `infra_type`: a tipologia construída (Ciclovia, Ciclofaixa...), vazia se não há estrutura no trecho.
  // `status`: o que aconteceu com o PDC ali (pdc_realizado_designado, pdc_nao_realizado...), vazio se o trecho não conta.
  features: { type: "Feature"; properties: { infra_type: string | null; status: string | null }; geometry: LineGeometry }[];
};

// ~2 m de simplificação e 5 casas decimais, como na página de execução cicloviária.
const SIMPLIFY_DEGREES = 0.00002;

export async function getCyclingMapGeojson(db: Db): Promise<CyclingMapGeojson> {
  const [row] = (
    await db.execute<{ collection: CyclingMapGeojson }>(sql`
      select json_build_object('type', 'FeatureCollection', 'features', coalesce(json_agg(json_build_object(
        'type', 'Feature',
        'properties', json_build_object('infra_type', t.label, 'status', ws.status),
        'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(w.geom, ${SIMPLIFY_DEGREES}), 5)::json)), '[]'::json)) as collection
      from cycling_way w
      left join cycling_way_status ws on ws.way_id = w.id
      left join cycling_typology t on t.key = w.built_typology_key
      where ws.status is not null or w.built_typology_key is not null`)
  ).rows;
  return row?.collection ?? { type: "FeatureCollection", features: [] };
}

// ---- Pesquisa de perfil: pontos de entrevista ---------------------------------------------------------------------

// `anos`: as edições da pesquisa marcadas no painel (vazio ou ausente: todas).
export type PerfilFilters = { anos?: number[]; genero?: string; raca?: string; socio?: string; dias?: string };

// Cada "Todas" (ou ausência) é "sem filtro". `dias` é "5 dias" ou "5": o número de dias por semana.
const asFilter = (v: string | undefined) => (v && v !== "Todas" && v !== "Todos" ? v : undefined);

export type PerfilPointRow = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  total_profiles: number;
  // Entrevistas que passam nos filtros (0 se nenhuma): nunca inventado.
  filtered_total: number;
  editions: string[];
};

export async function getPerfilPoints(db: Db, filters: PerfilFilters = {}): Promise<PerfilPointRow[]> {
  const genero = asFilter(filters.genero);
  const raca = asFilter(filters.raca);
  const socio = asFilter(filters.socio);
  const diasDigits = asFilter(filters.dias)?.match(/\d+/)?.[0];
  const dias = diasDigits === undefined ? undefined : Number(diasDigits);
  const anos = filters.anos?.length ? filters.anos : undefined;
  const rows = (
    await db.execute<{ id: number; name: string; lat: number; lng: number; total: number; filtered: number; editions: number[] }>(sql`
      select p.id, p.name, p.latitude as lat, p.longitude as lng,
        count(*)::int as total,
        (count(*) filter (where true
          ${anos ? sql`and s.year in (${sql.join(anos.map((a) => sql`${a}`), sql`, `)})` : sql``}
          ${genero ? sql`and g.label = ${genero}` : sql``}
          ${raca ? sql`and r.label = ${raca}` : sql``}
          ${socio ? sql`and inc.label = ${socio}` : sql``}
          ${dias !== undefined ? sql`and i.days_per_week = ${dias}` : sql``}))::int as filtered,
        array_agg(distinct s.year order by s.year) as editions
      from profile_interview i
      join profile_survey s on s.id = i.survey_id
      join profile_point p on p.id = i.point_id
      left join profile_option g on g.id = i.gender_id
      left join profile_option r on r.id = i.color_race_id
      left join profile_option inc on inc.id = i.income_id
      group by p.id, p.name, p.latitude, p.longitude
      order by p.name`)
  ).rows;
  return rows.map((r) => ({ id: r.id, name: r.name, lat: r.lat, lng: r.lng, total_profiles: r.total, filtered_total: r.filtered, editions: r.editions.map(String) }));
}

// Um ponto numa edição da pesquisa, no formato que o mapa já lia ("survey-locations").
export type PerfilLocation = {
  coordinates: { lat: number; lon: number };
  location_info: { neighborhood: string; street: string; area: string; survey_year: string };
  statistics: {
    total_responses: string;
    avg_age: number;
    avg_days_per_week: number;
    avg_trip_time_minutes: number;
    gender_distribution: { male_percentage: number; female_percentage: number };
    private_bike_percentage: number;
    accidents_percentage: number;
    top_motivation: string;
    top_issue: string;
  };
};

const num = (v: number | string | null) => (v === null ? 0 : Math.round(Number(v) * 10) / 10);

export async function getPerfilLocations(db: Db): Promise<{ filters: Record<string, never>; total_locations: number; locations: PerfilLocation[] }> {
  const rows = (
    await db.execute<{
      name: string; lat: number; lng: number; year: number; neighborhood: string | null; area: string | null; total: number;
      avg_age: string | null; avg_days: string | null; avg_trip: string | null; male: string | null; female: string | null;
      private_bike: string | null; accidents: string | null; motivation: string | null; issue: string | null;
    }>(sql`
      select p.name, p.latitude as lat, p.longitude as lng, s.year,
        mode() within group (order by i.neighborhood) as neighborhood,
        mode() within group (order by a.label) as area,
        count(*)::int as total,
        avg(i.age) filter (where i.age between 5 and 100) as avg_age,
        avg(i.days_per_week) as avg_days,
        avg(i.trip_minutes) filter (where i.trip_minutes between 1 and 300) as avg_trip,
        100.0 * count(*) filter (where g.label = 'Masculino') / nullif(count(g.id), 0) as male,
        100.0 * count(*) filter (where g.label = 'Feminino') / nullif(count(g.id), 0) as female,
        100.0 * count(*) filter (where i.shared_bike is false) / nullif(count(i.shared_bike), 0) as private_bike,
        100.0 * count(*) filter (where i.had_collision) / nullif(count(i.had_collision), 0) as accidents,
        mode() within group (order by m.label) as motivation,
        mode() within group (order by bi.label) as issue
      from profile_interview i
      join profile_survey s on s.id = i.survey_id
      join profile_point p on p.id = i.point_id
      left join profile_option g on g.id = i.gender_id
      left join profile_option a on a.id = i.area_id
      left join profile_option m on m.id = i.motivation_start_id
      left join profile_option bi on bi.id = i.biggest_issue_id
      group by p.id, p.name, p.latitude, p.longitude, s.year
      order by p.name, s.year`)
  ).rows;
  const locations = rows.map<PerfilLocation>((r) => ({
    coordinates: { lat: r.lat, lon: r.lng },
    location_info: { neighborhood: r.neighborhood ?? "", street: r.name, area: r.area ?? "", survey_year: String(r.year) },
    statistics: {
      total_responses: String(r.total),
      avg_age: num(r.avg_age),
      avg_days_per_week: num(r.avg_days),
      avg_trip_time_minutes: num(r.avg_trip),
      gender_distribution: { male_percentage: num(r.male), female_percentage: num(r.female) },
      private_bike_percentage: num(r.private_bike),
      accidents_percentage: num(r.accidents),
      top_motivation: r.motivation ?? "",
      top_issue: r.issue ?? "",
    },
  }));
  return { filters: {}, total_locations: locations.length, locations };
}

// ---- Contagens da Ameciclo, no formato que o mapa lia -----------------------------------------------------------

export type CountLocation = {
  id: number;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  counts: {
    id: number;
    date: string;
    total_cyclists: number;
    // As características como o banco as guarda (cargo, helmet, juveniles, motor, ride, service, shared_bike, sidewalk, women, wrong_way).
    characteristics: PublicCharacteristics;
    women: number;
    passengers: number;
    service: number;
    cargo: number;
    wrong_way: number;
    sidewalk: number;
    children: number;
    helmet: number;
  }[];
};

// Cada local com as suas contagens, da mais recente para a mais antiga; as características (mulheres, carona, serviço...)
// no nível da contagem, onde o mapa as lê.
export async function getCountLocations(db: Db): Promise<CountLocation[]> {
  const locations = await loadPublicLocations(db);
  return locations.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    latitude: l.latitude,
    longitude: l.longitude,
    counts: [...l.counts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((c) => ({
        id: c.id,
        date: c.date,
        total_cyclists: c.total_cyclists,
        characteristics: c.characteristics,
        women: c.characteristics.women,
        passengers: c.characteristics.ride,
        service: c.characteristics.service,
        cargo: c.characteristics.cargo,
        wrong_way: c.characteristics.wrong_way,
        sidewalk: c.characteristics.sidewalk,
        children: c.characteristics.juveniles,
        helmet: c.characteristics.helmet,
      })),
  }));
}
