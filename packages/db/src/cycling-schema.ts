import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  customType,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  pgView,
  primaryKey,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Infraestrutura cicloviária
//
// O plano (projetos do PDC Cicloviário) e a realidade (trechos mapeados no
// OpenStreetMap) em duas pontas, ligadas por cycling_way_project. O status de
// execução de cada trecho nunca é guardado: sai da view cycling_way_status.
// Geometria e tags do OSM são somente leitura; o admin edita o plano, os
// vínculos e a cidade de cada trecho.
// ---------------------------------------------------------------------------

// PostGIS geometry in EPSG:4326. Drizzle only ships points, so lines and
// polygons are a custom type. Reads come back as hex EWKB: select
// ST_AsGeoJSON(col) when a geometry is needed. Writes take a SQL expression,
// e.g. sql`ST_SetSRID(ST_GeomFromGeoJSON(${json}), 4326)`.
const geometry = (name: string, kind: "Geometry" | "MultiPolygon") =>
  customType<{ data: string }>({ dataType: () => `geometry(${kind}, 4326)` })(name);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const cyclingStageEnum = pgEnum("cycling_stage", ["existing", "proposed", "planned"]);
export const cyclingSyncKindEnum = pgEnum("cycling_sync_kind", ["import", "osm"]);
export const cyclingSyncStatusEnum = pgEnum("cycling_sync_status", ["running", "success", "failed"]);

export const cyclingCity = pgTable("cycling_city", {
  ibgeCode: integer("ibge_code").primaryKey(),
  name: text("name").notNull(),
  isRmr: boolean("is_rmr").notNull().default(false),
  boundary: geometry("boundary", "MultiPolygon"),
});

export const cyclingTypology = pgTable("cycling_typology", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  color: text("color").notNull(),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const cyclingAgency = pgTable("cycling_agency", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
});

export const cyclingPdcProject = pgTable("cycling_pdc_project", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  // Código do PDC, ex. CM38.
  ref: text("ref").notNull().unique(),
  osmRelationId: bigint("osm_relation_id", { mode: "number" }).unique(),
  name: text("name").notNull(),
  // Tipologia prevista no plano.
  typologyKey: text("typology_key")
    .notNull()
    .references(() => cyclingTypology.key),
  stage: cyclingStageEnum("stage").notNull(),
  // O "Local" da descrição: onde o projeto passa, em texto.
  stretch: text("stretch"),
  plannedKm: numeric("planned_km", { precision: 8, scale: 2, mode: "number" }),
  notes: text("notes"),
  osmTags: jsonb("osm_tags").$type<Record<string, string>>(),
  ...timestamps,
});

// Quem executa o projeto; obras conjuntas têm mais de um.
export const cyclingPdcProjectAgency = pgTable(
  "cycling_pdc_project_agency",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => cyclingPdcProject.id, { onDelete: "cascade" }),
    agencyId: integer("agency_id")
      .notNull()
      .references(() => cyclingAgency.id),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.agencyId] })],
);

export const cyclingPdcProjectCity = pgTable(
  "cycling_pdc_project_city",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => cyclingPdcProject.id, { onDelete: "cascade" }),
    cityIbge: integer("city_ibge")
      .notNull()
      .references(() => cyclingCity.ibgeCode),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.cityIbge] })],
);

export const cyclingSyncRun = pgTable("cycling_sync_run", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  kind: cyclingSyncKindEnum("kind").notNull(),
  // De onde vieram os dados: arquivo, consulta Overpass, ...
  sourceRef: text("source_ref"),
  status: cyclingSyncStatusEnum("status").notNull().default("running"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  waysAdded: integer("ways_added"),
  waysUpdated: integer("ways_updated"),
  waysRemoved: integer("ways_removed"),
  error: text("error"),
  triggeredBy: text("triggered_by"),
});

// Trecho: a stretch of street made of several OpenStreetMap ways, as the
// IDECiclo composes them before evaluating. Created in the admin, from the
// suggestions or by hand; city, typology and length come from its ways.
export const cyclingStretch = pgTable("cycling_stretch", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  ...timestamps,
});

export const cyclingWay = pgTable(
  "cycling_way",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    osmId: bigint("osm_id", { mode: "number" }).notNull().unique(),
    name: text("name"),
    highway: text("highway"),
    geom: geometry("geom", "Geometry").notNull(),
    lengthM: doublePrecision("length_m").generatedAlwaysAs(sql`ST_Length(geom::geography)`),
    cityIbge: integer("city_ibge").references(() => cyclingCity.ibgeCode),
    // true: o admin escolheu a cidade, o importador não mexe.
    cityManual: boolean("city_manual").notNull().default(false),
    hasCycleway: boolean("has_cycleway").notNull().default(false),
    // Tipologia construída, lida das tags do OSM.
    builtTypologyKey: text("built_typology_key").references(() => cyclingTypology.key),
    surface: text("surface"),
    oneway: boolean("oneway"),
    maxspeedKmh: smallint("maxspeed_kmh"),
    lit: boolean("lit"),
    dualCarriageway: boolean("dual_carriageway").notNull().default(false),
    // Todas as tags do OSM, inclusive as promovidas acima.
    tags: jsonb("tags").$type<Record<string, string>>().notNull().default({}),
    // Trecho (rua) a que este segmento pertence, se alguém o compôs.
    stretchId: integer("stretch_id").references(() => cyclingStretch.id, { onDelete: "set null" }),
    // Trecho que sumiu do OSM: fica no banco, só deixa de contar.
    removedAt: timestamp("removed_at", { withTimezone: true }),
    firstSeenRunId: integer("first_seen_run_id").references(() => cyclingSyncRun.id),
    lastSeenRunId: integer("last_seen_run_id").references(() => cyclingSyncRun.id),
    ...timestamps,
  },
  (t) => [
    index("cycling_way_geom_idx").using("gist", t.geom),
    index("cycling_way_city_idx").on(t.cityIbge),
    index("cycling_way_stretch_idx").on(t.stretchId),
  ],
);

export const cyclingWayProject = pgTable(
  "cycling_way_project",
  {
    wayId: integer("way_id")
      .notNull()
      .references(() => cyclingWay.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => cyclingPdcProject.id, { onDelete: "cascade" }),
    // true: vínculo feito no admin, o importador não remove.
    manual: boolean("manual").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.wayId, t.projectId] }), index("cycling_way_project_project_idx").on(t.projectId)],
);

export const cyclingSummarySnapshot = pgTable(
  "cycling_summary_snapshot",
  {
    runId: integer("run_id")
      .notNull()
      .references(() => cyclingSyncRun.id, { onDelete: "cascade" }),
    cityIbge: integer("city_ibge")
      .notNull()
      .references(() => cyclingCity.ibgeCode),
    pdcRealizadoDesignadoKm: doublePrecision("pdc_realizado_designado_km").notNull(),
    pdcRealizadoNaoDesignadoKm: doublePrecision("pdc_realizado_nao_designado_km").notNull(),
    realizadoForaPdcKm: doublePrecision("realizado_fora_pdc_km").notNull(),
    pdcNaoRealizadoKm: doublePrecision("pdc_nao_realizado_km").notNull(),
    plannedKm: doublePrecision("planned_km").notNull(),
  },
  (t) => [primaryKey({ columns: [t.runId, t.cityIbge] })],
);

// Status de execução de cada trecho ativo. Com ciclovia construída, é
// "designado" se a tipologia construída bate com a de qualquer projeto a que
// o trecho pertence. Sem ciclovia mas com projeto, o plano não saiu do papel.
export const cyclingWayStatus = pgView("cycling_way_status", {
  wayId: integer("way_id").notNull(),
  cityIbge: integer("city_ibge"),
  lengthM: doublePrecision("length_m"),
  status: text("status"),
}).as(sql`
  SELECT
    w.id AS way_id,
    w.city_ibge,
    w.length_m,
    CASE
      WHEN w.has_cycleway AND NOT EXISTS (
        SELECT 1 FROM cycling_way_project wp WHERE wp.way_id = w.id
      ) THEN 'realizado_fora_pdc'
      WHEN w.has_cycleway AND EXISTS (
        SELECT 1 FROM cycling_way_project wp
        JOIN cycling_pdc_project p ON p.id = wp.project_id
        WHERE wp.way_id = w.id AND p.typology_key = w.built_typology_key
      ) THEN 'pdc_realizado_designado'
      WHEN w.has_cycleway THEN 'pdc_realizado_nao_designado'
      WHEN EXISTS (
        SELECT 1 FROM cycling_way_project wp WHERE wp.way_id = w.id
      ) THEN 'pdc_nao_realizado'
    END AS status
  FROM cycling_way w
  WHERE w.removed_at IS NULL
`);

// Km por status em cada cidade, somados pela geometria dos trechos. Como cada
// trecho tem uma cidade só, um projeto que cruza municípios não conta em dobro.
export const cyclingCitySummary = pgView("cycling_city_summary", {
  cityIbge: integer("city_ibge").notNull(),
  pdcRealizadoDesignadoKm: doublePrecision("pdc_realizado_designado_km").notNull(),
  pdcRealizadoNaoDesignadoKm: doublePrecision("pdc_realizado_nao_designado_km").notNull(),
  realizadoForaPdcKm: doublePrecision("realizado_fora_pdc_km").notNull(),
  pdcNaoRealizadoKm: doublePrecision("pdc_nao_realizado_km").notNull(),
}).as(sql`
  SELECT
    city_ibge,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'pdc_realizado_designado'), 0) / 1000 AS pdc_realizado_designado_km,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'pdc_realizado_nao_designado'), 0) / 1000 AS pdc_realizado_nao_designado_km,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'realizado_fora_pdc'), 0) / 1000 AS realizado_fora_pdc_km,
    COALESCE(SUM(length_m) FILTER (WHERE status = 'pdc_nao_realizado'), 0) / 1000 AS pdc_nao_realizado_km
  FROM cycling_way_status
  WHERE city_ibge IS NOT NULL
  GROUP BY city_ibge
`);
