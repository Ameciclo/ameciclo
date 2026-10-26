import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// IDECiclo: avaliação da qualidade da infraestrutura cicloviária por cidade.
//
// Vem do ideciclo-site (React + Supabase). As cidades são as do IBGE (id = código),
// os trechos nascem da malha do OpenStreetMap e podem ser mesclados num trecho
// "pai"; cada trecho avaliado tem um formulário com as respostas e as notas por
// eixo (reviews).
// ---------------------------------------------------------------------------

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const ideSegmentTypeEnum = pgEnum("ideciclo_segment_type", ["Ciclofaixa", "Ciclovia", "Ciclorrota", "Compartilhada"]);
export const ideRatingTypeEnum = pgEnum("ideciclo_rating_type", ["A", "B", "C", "D"]);

export const ideCity = pgTable(
  "ideciclo_city",
  {
    // Código do IBGE, como texto.
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    state: text("state").notNull(),
    evaluatedKm: numeric("extensao_avaliada", { mode: "number" }).notNull().default(0),
    ideciclo: numeric("ideciclo", { mode: "number" }).notNull().default(0),
    structuralKm: numeric("vias_estruturais_km", { mode: "number" }).notNull().default(0),
    feederKm: numeric("vias_alimentadoras_km", { mode: "number" }).notNull().default(0),
    localKm: numeric("vias_locais_km", { mode: "number" }).notNull().default(0),
    // Só entra no ranking quando liberada e com ao menos um formulário salvo.
    showInRanking: boolean("show_in_ranking").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("ideciclo_city_state_idx").on(t.state)],
);

export const ideSegment = pgTable(
  "ideciclo_segment",
  {
    id: text("id").primaryKey(),
    cityId: text("id_cidade")
      .notNull()
      .references(() => ideCity.id, { onDelete: "cascade" }),
    formId: text("id_form"),
    name: text("name").notNull(),
    type: ideSegmentTypeEnum("type").notNull(),
    length: numeric("length", { mode: "number" }).notNull(),
    neighborhood: text("neighborhood"),
    geometry: jsonb("geometry"),
    selected: boolean("selected").default(false),
    evaluated: boolean("evaluated").default(false),
    isMerged: boolean("is_merged").default(false),
    parentSegmentId: text("parent_segment_id").references((): AnyPgColumn => ideSegment.id, { onDelete: "cascade" }),
    mergedSegments: jsonb("merged_segments").default([]),
    // estrutural, alimentadora ou local.
    classification: text("classification"),
    osmAdvanced: jsonb("osm_advanced"),
    // Apagado na tela de refinamento: fica na lixeira, pode ser restaurado.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("ideciclo_segment_city_idx").on(t.cityId),
    index("ideciclo_segment_parent_idx").on(t.parentSegmentId),
    index("ideciclo_segment_deleted_idx").on(t.deletedAt),
  ],
);

export const ideForm = pgTable(
  "ideciclo_form",
  {
    id: text("id").primaryKey(),
    segmentId: text("segment_id")
      .notNull()
      .references(() => ideSegment.id, { onDelete: "cascade" }),
    cityId: text("city_id")
      .notNull()
      .references(() => ideCity.id, { onDelete: "cascade" }),
    researcher: text("researcher"),
    date: timestamp("date", { withTimezone: true }),
    streetName: text("street_name"),
    neighborhood: text("neighborhood"),
    extension: numeric("extension", { mode: "number" }),
    startPoint: text("start_point"),
    endPoint: text("end_point"),
    hierarchy: text("hierarchy"),
    observations: text("observations"),
    // Todas as respostas do questionário.
    responses: jsonb("responses").$type<Record<string, unknown>>(),
    velocity: integer("velocity"),
    blocksCount: integer("blocks_count"),
    intersectionsCount: integer("intersections_count"),
    ...timestamps,
  },
  (t) => [index("ideciclo_form_city_idx").on(t.cityId), index("ideciclo_form_segment_idx").on(t.segmentId)],
);

export const ideReview = pgTable(
  "ideciclo_review",
  {
    id: text("id").primaryKey(),
    formId: text("form_id")
      .notNull()
      .references(() => ideForm.id, { onDelete: "cascade" }),
    ratingName: ideRatingTypeEnum("rating_name").notNull(),
    rating: integer("rating").notNull(),
    weight: numeric("weight", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ideciclo_review_form_idx").on(t.formId)],
);
