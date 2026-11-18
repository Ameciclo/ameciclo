import { sql } from "drizzle-orm";

import type { Db } from "../index";

export type PlacesFeatureCollection = {
  type: "FeatureCollection";
  features: { type: "Feature"; id: number; properties: Record<string, string | number | null>; geometry: { type: "Point"; coordinates: [number, number] } }[];
};

const empty: PlacesFeatureCollection = { type: "FeatureCollection", features: [] };

// Os bicicletários do OpenStreetMap como GeoJSON para o mapa do CicloDados (as chaves das propriedades são as etiquetas do OSM).
export async function getBicycleRacksGeojson(db: Db): Promise<PlacesFeatureCollection> {
  const [row] = (
    await db.execute<{ collection: PlacesFeatureCollection }>(sql`
      select json_build_object('type', 'FeatureCollection', 'features', coalesce(json_agg(json_build_object(
        'type', 'Feature', 'id', r.id,
        'properties', json_build_object('name', r.name, 'capacity', r.capacity, 'covered', r.covered, 'access', r.access,
                                        'operator', r.operator, 'bicycle_parking', r.parking_type),
        'geometry', ST_AsGeoJSON(r.geom, 6)::json) order by r.id), '[]'::json)) as collection
      from bicycle_rack r`)
  ).rows;
  return row?.collection ?? empty;
}

// As estações de bicicleta compartilhada (Bike PE).
export async function getBikeStationsGeojson(db: Db): Promise<PlacesFeatureCollection> {
  const [row] = (
    await db.execute<{ collection: PlacesFeatureCollection }>(sql`
      select json_build_object('type', 'FeatureCollection', 'features', coalesce(json_agg(json_build_object(
        'type', 'Feature', 'id', s.id,
        'properties', json_build_object('name', s.name, 'ref', s.ref, 'capacity', s.capacity, 'operator', s.operator, 'network', s.network),
        'geometry', ST_AsGeoJSON(s.geom, 6)::json) order by s.id), '[]'::json)) as collection
      from bike_share_station s`)
  ).rows;
  return row?.collection ?? empty;
}
