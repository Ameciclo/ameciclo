import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { ContagemDocument } from "./document/types";

export const topologyEnum = pgEnum("topology", ["point", "t_junction", "crossroad"]);
export const granularityEnum = pgEnum("granularity", ["hourly", "total"]);
export const statusEnum = pgEnum("contagem_status", ["draft", "published"]);
export const basisEnum = pgEnum("basis", ["observed", "projected"]);
export const blockEnum = pgEnum("observation_block", ["padroes", "observacoes"]);
export const revisionKindEnum = pgEnum("revision_kind", ["import", "create", "edit", "revert"]);
export const issueOriginEnum = pgEnum("issue_origin", ["import", "validation"]);
export const issueStatusEnum = pgEnum("issue_status", ["open", "resolved", "ignored"]);
export const severityEnum = pgEnum("warning_severity", ["info", "warning", "error"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export type ContagemSource = {
  driveFileId?: string;
  fileName?: string;
  sheetNames?: string[];
  parserVersion?: string;
  importedAt?: string;
};

export const local = pgTable("local", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  ...timestamps,
});

export const contagem = pgTable(
  "contagem",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    localId: integer("local_id")
      .notNull()
      .references(() => local.id, { onDelete: "restrict" }),
    // Distinguishes counts at the same place and day, e.g. "Pista Leste".
    variant: text("variant"),
    date: date("date", { mode: "string" }).notNull(),
    // Date as written in the source, kept when it was corrected.
    sourceDate: date("source_date", { mode: "string" }),
    dateNote: text("date_note"),
    startedAt: time("started_at"),
    endedAt: time("ended_at"),
    topology: topologyEnum("topology").notNull(),
    // Ordered approach labels, snapshotted per count. Movement indexes point here.
    approaches: text("approaches").array().notNull(),
    bucketMinutes: smallint("bucket_minutes").notNull().default(60),
    granularity: granularityEnum("granularity").notNull().default("hourly"),
    // Bucket indexes actually counted; null means every bucket.
    observedBuckets: smallint("observed_buckets").array(),
    isProjected: boolean("is_projected").notNull().default(false),
    status: statusEnum("status").notNull().default("published"),
    reportUrl: text("report_url"),
    notes: text("notes"),
    layout: text("layout"),
    // Bumped on every save; a save with a stale version is rejected.
    version: integer("version").notNull().default(1),
    // Materialized from movement_count at write time, for cheap list views.
    totalCyclists: integer("total_cyclists"),
    peakBucketCount: integer("peak_bucket_count"),
    source: jsonb("source").$type<ContagemSource>(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("contagem_local_date_variant_idx").on(
      t.localId,
      t.date,
      sql`coalesce(${t.variant}, '')`,
    ),
    index("contagem_date_idx").on(t.date),
  ],
);

// Movement counts between approaches. bucket is null for a session total.
export const movementCount = pgTable(
  "movement_count",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    contagemId: integer("contagem_id")
      .notNull()
      .references(() => contagem.id, { onDelete: "cascade" }),
    basis: basisEnum("basis").notNull().default("observed"),
    fromIdx: smallint("from_idx").notNull(),
    toIdx: smallint("to_idx").notNull(),
    bucket: smallint("bucket"),
    value: integer("value").notNull(),
  },
  (t) => [
    uniqueIndex("movement_count_cell_idx").on(
      t.contagemId,
      t.basis,
      t.fromIdx,
      t.toIdx,
      sql`coalesce(${t.bucket}, -1)`,
    ),
  ],
);

// Dictionary of canonical characteristics. parentKey drives rollups
// (carona_crianca -> caronas).
export const characteristic = pgTable("characteristic", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  group: text("group").notNull(),
  parentKey: text("parent_key").references((): AnyPgColumn => characteristic.key),
  isRollup: boolean("is_rollup").notNull().default(false),
});

// Normalized raw label -> canonical key. Unmapped labels land in the review queue.
export const characteristicAlias = pgTable("characteristic_alias", {
  alias: text("alias").primaryKey(),
  characteristicKey: text("characteristic_key")
    .notNull()
    .references(() => characteristic.key, { onDelete: "cascade" }),
});

// Every characteristic row as collected. characteristicKey stays null until mapped.
export const observation = pgTable(
  "observation",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    contagemId: integer("contagem_id")
      .notNull()
      .references(() => contagem.id, { onDelete: "cascade" }),
    basis: basisEnum("basis").notNull().default("observed"),
    block: blockEnum("block").notNull(),
    position: smallint("position").notNull(),
    rawLabel: text("raw_label").notNull(),
    characteristicKey: text("characteristic_key").references(() => characteristic.key),
    bucket: smallint("bucket"),
    value: integer("value").notNull(),
  },
  (t) => [
    uniqueIndex("observation_cell_idx").on(
      t.contagemId,
      t.basis,
      t.block,
      t.position,
      sql`coalesce(${t.bucket}, -1)`,
    ),
    index("observation_key_idx").on(t.characteristicKey),
  ],
);

// Per-bucket conditions such as rain. These are not counts.
export const condition = pgTable(
  "condition",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    contagemId: integer("contagem_id")
      .notNull()
      .references(() => contagem.id, { onDelete: "cascade" }),
    bucket: smallint("bucket").notNull(),
    kind: text("kind").notNull(),
    value: numeric("value", { mode: "number" }),
    note: text("note"),
  },
  (t) => [uniqueIndex("condition_cell_idx").on(t.contagemId, t.bucket, t.kind)],
);

export const note = pgTable("note", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  contagemId: integer("contagem_id")
    .notNull()
    .references(() => contagem.id, { onDelete: "cascade" }),
  bucketFrom: smallint("bucket_from"),
  bucketTo: smallint("bucket_to"),
  text: text("text").notNull(),
});

// Despite the name, these are the review items for a contagem: import notes
// (origin "import") and checks recomputed on every save (origin "validation").
export const importWarning = pgTable(
  "import_warning",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    contagemId: integer("contagem_id")
      .notNull()
      .references(() => contagem.id, { onDelete: "cascade" }),
    severity: severityEnum("severity").notNull(),
    code: text("code").notNull(),
    message: text("message").notNull(),
    ref: text("ref"),
    origin: issueOriginEnum("origin").notNull().default("import"),
    status: issueStatusEnum("status").notNull().default("open"),
    resolvedBy: text("resolved_by"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"),
  },
  (t) => [index("import_warning_contagem_idx").on(t.contagemId, t.status)],
);

// Immutable history: the full document as it was after each save. Diffs are
// computed by comparing two snapshots.
export const contagemRevision = pgTable(
  "contagem_revision",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    contagemId: integer("contagem_id")
      .notNull()
      .references(() => contagem.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    kind: revisionKindEnum("kind").notNull(),
    author: text("author").notNull(),
    reason: text("reason"),
    revertedFromVersion: integer("reverted_from_version"),
    changeCount: integer("change_count").notNull().default(0),
    snapshot: jsonb("snapshot").$type<ContagemDocument>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("contagem_revision_version_idx").on(t.contagemId, t.version)],
);
