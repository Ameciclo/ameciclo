import { customType, index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Bicicletários e estações de bicicleta compartilhada (Bike PE), do OpenStreetMap
//
// Pontos mapeados por voluntários no OSM, copiados para o banco a cada importação (db:import-osm-lugares): cada
// execução substitui tudo, numa transação. O CicloDados lê daqui para as camadas "Bicicletários" e "Estações de Bike PE".
// ---------------------------------------------------------------------------

// PostGIS point in EPSG:4326 (ver cycling-schema). Escrita: sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`.
const point = (name: string) => customType<{ data: string }>({ dataType: () => "geometry(Point, 4326)" })(name);

export const bicycleRack = pgTable(
  "bicycle_rack",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // "node/123" ou "way/456": o elemento do OSM.
    osmId: text("osm_id").notNull().unique(),
    name: text("name"),
    // Vagas, quando a etiqueta é um número.
    capacity: integer("capacity"),
    // Etiquetas como o OSM as escreve: covered = yes/no, access = yes/private/customers...
    covered: text("covered"),
    access: text("access"),
    operator: text("operator"),
    // bicycle_parking: stands, wall_loops, shed, building...
    parkingType: text("parking_type"),
    geom: point("geom").notNull(),
    tags: jsonb("tags").$type<Record<string, string>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("bicycle_rack_geom_idx").using("gist", t.geom)],
);

export const bikeShareStation = pgTable(
  "bike_share_station",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    osmId: text("osm_id").notNull().unique(),
    name: text("name"),
    // O número da estação na rede ("79").
    ref: text("ref"),
    capacity: integer("capacity"),
    network: text("network"),
    operator: text("operator"),
    geom: point("geom").notNull(),
    tags: jsonb("tags").$type<Record<string, string>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("bike_share_station_geom_idx").using("gist", t.geom)],
);
