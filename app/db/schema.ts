import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Local-dev SQLite shape. Mirrors the eventual Postgres table 1:1 in
 * column names and meaning; only the dialect-specific bits change at
 * the end of this PR (sqliteTable → pgTable, text-json → jsonb,
 * json_extract → arrow operator). The Zod schemas in
 * app/admin/contagens/schema/ are the dialect-independent truth for
 * the `data` payload.
 */
export const contagem = sqliteTable(
  "contagem",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    // Place identity. Without a Local table, the human-typed name is the
    // de facto key; we enforce one contagem per (place, day) below.
    localName: text("local_name").notNull(),

    // Wall-clock start of the session, ISO 8601 without offset
    // ("2024-06-06T06:00:00"). Combined with `timezone` to derive the
    // actual UTC instant when needed; rendered as-is in the UI.
    startedAt: text("started_at").notNull(),
    timezone: text("timezone").notNull().default("America/Recife"),

    // Sampling resolution. All buckets in a session share one width.
    bucketMinutes: integer("bucket_minutes").notNull(),
    bucketCount: integer("bucket_count").notNull(),

    // Geometry (single point representing WHERE; flow is encoded by topology
    // + approach labels inside `data`).
    latitude: real("latitude"),
    longitude: real("longitude"),

    topology: text("topology").notNull(), // 'point' | 't_junction' | 'crossroad'

    // Free-text session-level notes (weather summary, observer comments...).
    notes: text("notes"),

    // Variant tag for the JSON shape — different teams / evolving standards
    // may produce different dialects. Code dispatches on this.
    schema: text("schema").notNull().default("ameciclo.v1"),

    // The full payload: approaches, movements, characteristics, outros, …
    // Validated by Zod schemas in app/admin/contagens/schema/.
    data: text("data", { mode: "json" }).notNull().$type<unknown>(),

    // Materialized totals for cheap list-view filtering. Computed from
    // `data.totals.*` at write time; stored as generated columns so they
    // can never disagree with the JSON.
    totalCyclists: integer("total_cyclists").generatedAlwaysAs(
      sql`json_extract("data", '$.totals.cyclists')`,
      { mode: "stored" },
    ),
    peakBucketCount: integer("peak_bucket_count").generatedAlwaysAs(
      sql`json_extract("data", '$.totals.peakBucketCount')`,
      { mode: "stored" },
    ),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    // One contagem per place per day (per the user clarification — different
    // years are fine, simultaneous sessions are not).
    uniqueIndex("uniq_local_date").on(t.localName, sql`date(${t.startedAt})`),
  ],
);

export type Contagem = typeof contagem.$inferSelect;
export type NewContagem = typeof contagem.$inferInsert;
