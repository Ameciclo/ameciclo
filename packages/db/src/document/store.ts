import { and, desc, eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { relations } from "../relations";
import { slugify } from "../import/locals";
import {
  characteristic,
  condition,
  contagem,
  contagemRevision,
  importWarning,
  local,
  movementCount,
  note,
  observation,
} from "../schema";
import { diffDocuments } from "./diff";
import { detectIssues } from "./issues";
import type {
  Basis,
  ContagemDocument,
  DocumentMovement,
  DocumentObservation,
  RevisionKind,
} from "./types";
import { validateDocument } from "./validate";

type Db = NodePgDatabase<typeof relations>;

export class VersionConflictError extends Error {
  constructor(
    readonly currentVersion: number,
    readonly lastAuthor: string | null,
  ) {
    super("version_conflict");
  }
}

export class DuplicateContagemError extends Error {
  constructor(readonly existingId: number) {
    super("duplicate_contagem");
  }
}

export class InvalidDocumentError extends Error {
  constructor(readonly problems: string[]) {
    super("invalid_document");
  }
}

const hourOf = (time: string | null) => Number.parseInt(time ?? "6", 10);

function bucketCountOf(startedAt: string | null, endedAt: string | null, bucketMinutes: number): number {
  if (!startedAt || !endedAt) return 0;
  return Math.max(0, Math.round(((hourOf(endedAt) - hourOf(startedAt)) * 60) / bucketMinutes));
}

export async function loadDocument(
  db: Db,
  id: number,
): Promise<{ doc: ContagemDocument; version: number } | null> {
  const row = await db.query.contagem.findFirst({ where: { id } });
  if (!row) return null;

  // One connection runs one query at a time.
  const movements = await db.query.movementCount.findMany({ where: { contagemId: id } });
  const observations = await db.query.observation.findMany({ where: { contagemId: id } });
  const conditions = await db.query.condition.findMany({ where: { contagemId: id } });
  const notes = await db.query.note.findMany({ where: { contagemId: id } });

  const declared = bucketCountOf(row.startedAt, row.endedAt, row.bucketMinutes);
  const highest = Math.max(
    -1,
    ...movements.map((m) => m.bucket ?? -1),
    ...observations.map((o) => o.bucket ?? -1),
  );
  const bucketCount = Math.max(declared, highest + 1);
  const zeros = () => Array.from<number>({ length: bucketCount }).fill(0);

  const movementMap = new Map<string, DocumentMovement>();
  for (const m of movements) {
    const key = `${m.basis}|${m.fromIdx}|${m.toIdx}`;
    const entry =
      movementMap.get(key) ?? { basis: m.basis, from: m.fromIdx, to: m.toIdx, cells: zeros(), total: null };
    if (m.bucket === null) entry.total = (entry.total ?? 0) + m.value;
    else entry.cells[m.bucket] += m.value;
    movementMap.set(key, entry);
  }

  const observationMap = new Map<string, DocumentObservation>();
  for (const o of observations) {
    const key = `${o.basis}|${o.block}|${o.position}`;
    const entry =
      observationMap.get(key) ??
      {
        basis: o.basis,
        block: o.block,
        position: o.position,
        rawLabel: o.rawLabel,
        characteristicKey: o.characteristicKey,
        cells: zeros(),
        total: null,
      };
    if (o.bucket === null) entry.total = (entry.total ?? 0) + o.value;
    else entry.cells[o.bucket] += o.value;
    observationMap.set(key, entry);
  }

  const doc: ContagemDocument = {
    schemaVersion: 1,
    header: {
      localId: row.localId,
      variant: row.variant,
      date: row.date,
      sourceDate: row.sourceDate,
      dateNote: row.dateNote,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      topology: row.topology,
      bucketMinutes: row.bucketMinutes,
      granularity: row.granularity,
      observedBuckets: row.observedBuckets,
      isProjected: row.isProjected,
      status: row.status,
      reportUrl: row.reportUrl,
      notes: row.notes,
      layout: row.layout,
    },
    approaches: row.approaches,
    movements: [...movementMap.values()].sort((a, b) => a.basis.localeCompare(b.basis) || a.from - b.from || a.to - b.to),
    observations: [...observationMap.values()].sort(
      (a, b) => a.basis.localeCompare(b.basis) || a.block.localeCompare(b.block) || a.position - b.position,
    ),
    conditions: conditions
      .map((c) => ({ bucket: c.bucket, kind: c.kind, value: c.value, note: c.note }))
      .sort((a, b) => a.kind.localeCompare(b.kind) || a.bucket - b.bucket),
    notes: notes.map((n) => ({ bucketFrom: n.bucketFrom, bucketTo: n.bucketTo, text: n.text })),
  };
  return { doc, version: row.version };
}

// Totals shown in lists are derived from the movements of the basis people see.
function derivedTotals(doc: ContagemDocument): { total: number; peak: number } {
  const wanted: Basis = doc.header.isProjected ? "projected" : "observed";
  const rows = doc.movements.filter((m) => m.basis === wanted);
  const buckets = Math.max(0, ...rows.map((m) => m.cells.length));
  const perBucket = Array.from<number>({ length: buckets }).fill(0);
  let total = 0;
  for (const m of rows) {
    m.cells.forEach((v, i) => (perBucket[i] += v));
    total += m.cells.reduce((s, v) => s + v, 0) + (m.total ?? 0);
  }
  return { total, peak: Math.max(0, ...perBucket) };
}

const chunk = <T>(rows: T[], size = 2000): T[][] =>
  Array.from({ length: Math.ceil(rows.length / size) }, (_, i) => rows.slice(i * size, (i + 1) * size));

// Replaces everything that belongs to the contagem with the document. Callers
// run it inside a transaction.
async function writeDocument(tx: Db, id: number, doc: ContagemDocument, version: number) {
  const h = doc.header;
  const { total, peak } = derivedTotals(doc);

  await tx
    .update(contagem)
    .set({
      localId: h.localId,
      variant: h.variant,
      date: h.date,
      sourceDate: h.sourceDate,
      dateNote: h.dateNote,
      startedAt: h.startedAt,
      endedAt: h.endedAt,
      topology: h.topology,
      approaches: doc.approaches,
      bucketMinutes: h.bucketMinutes,
      granularity: h.granularity,
      observedBuckets: h.observedBuckets,
      isProjected: h.isProjected,
      status: h.status,
      reportUrl: h.reportUrl,
      notes: h.notes,
      layout: h.layout,
      totalCyclists: total,
      peakBucketCount: peak,
      version,
      updatedAt: new Date(),
    })
    .where(eq(contagem.id, id));

  await tx.delete(movementCount).where(eq(movementCount.contagemId, id));
  await tx.delete(observation).where(eq(observation.contagemId, id));
  await tx.delete(condition).where(eq(condition.contagemId, id));
  await tx.delete(note).where(eq(note.contagemId, id));

  const movementRows = doc.movements.flatMap((m) => [
    ...m.cells.map((value, bucket) => ({ contagemId: id, basis: m.basis, fromIdx: m.from, toIdx: m.to, bucket, value })),
    ...(m.total === null
      ? []
      : [{ contagemId: id, basis: m.basis, fromIdx: m.from, toIdx: m.to, bucket: null, value: m.total }]),
  ]);
  for (const rows of chunk(movementRows)) await tx.insert(movementCount).values(rows);

  // Hourly zeros are not stored; a row with no hourly values keeps one total.
  const observationRows = doc.observations.flatMap((o) => {
    const base = {
      contagemId: id,
      basis: o.basis,
      block: o.block,
      position: o.position,
      rawLabel: o.rawLabel,
      characteristicKey: o.characteristicKey,
    };
    const hourly = o.cells.flatMap((value, bucket) => (value === 0 ? [] : [{ ...base, bucket, value }]));
    if (hourly.length > 0) return o.total === null ? hourly : [...hourly, { ...base, bucket: null, value: o.total }];
    return [{ ...base, bucket: null, value: o.total ?? 0 }];
  });
  for (const rows of chunk(observationRows)) await tx.insert(observation).values(rows);

  if (doc.conditions.length > 0) {
    await tx.insert(condition).values(doc.conditions.map((c) => ({ ...c, contagemId: id })));
  }
  if (doc.notes.length > 0) {
    await tx.insert(note).values(doc.notes.map((n) => ({ ...n, contagemId: id })));
  }
}

type NewRevision = {
  contagemId: number;
  version: number;
  kind: RevisionKind;
  author: string;
  reason: string | null;
  revertedFromVersion?: number;
  changeCount: number;
  doc: ContagemDocument;
};

async function insertRevision(tx: Db, r: NewRevision) {
  await tx.insert(contagemRevision).values({
    contagemId: r.contagemId,
    version: r.version,
    kind: r.kind,
    author: r.author,
    reason: r.reason,
    revertedFromVersion: r.revertedFromVersion ?? null,
    changeCount: r.changeCount,
    snapshot: r.doc,
  });
}

// First revision of an imported contagem, so the original is always recoverable.
export async function createInitialRevision(db: Db, id: number, author: string, kind: RevisionKind = "import") {
  const loaded = await loadDocument(db, id);
  if (!loaded) throw new Error(`contagem ${id} not found`);
  await insertRevision(db, {
    contagemId: id,
    version: loaded.version,
    kind,
    author,
    reason: null,
    changeCount: 0,
    doc: loaded.doc,
  });
  await reconcileIssues(db, id, loaded.doc);
}

// Recomputes the document checks and brings the stored issues in line with them,
// keeping whatever a person decided about an issue that is still there.
export async function reconcileIssues(db: Db, id: number, doc: ContagemDocument) {
  const dictionary = await db
    .select({ key: characteristic.key, parentKey: characteristic.parentKey, isRollup: characteristic.isRollup })
    .from(characteristic);
  const detected = detectIssues(doc, dictionary);
  const existing = await db
    .select()
    .from(importWarning)
    .where(and(eq(importWarning.contagemId, id), eq(importWarning.origin, "validation")));

  const keyOf = (i: { code: string; ref: string | null }) => `${i.code}|${i.ref ?? ""}`;
  const existingByKey = new Map(existing.map((e) => [keyOf(e), e]));
  const detectedKeys = new Set(detected.map(keyOf));

  for (const d of detected) {
    const found = existingByKey.get(keyOf(d));
    if (!found) {
      await db.insert(importWarning).values({ contagemId: id, origin: "validation", status: "open", ...d });
    } else if (found.status === "resolved") {
      await db
        .update(importWarning)
        .set({ severity: d.severity, message: d.message, status: "open", resolvedBy: null, resolvedAt: null, resolutionNote: null })
        .where(eq(importWarning.id, found.id));
    } else {
      await db.update(importWarning).set({ severity: d.severity, message: d.message }).where(eq(importWarning.id, found.id));
    }
  }
  for (const e of existing) {
    if (detectedKeys.has(keyOf(e)) || e.status !== "open") continue;
    await db
      .update(importWarning)
      .set({ status: "resolved", resolvedBy: "sistema", resolvedAt: new Date(), resolutionNote: "Deixou de ocorrer após uma edição." })
      .where(eq(importWarning.id, e.id));
  }
}

export async function setIssueStatus(
  db: Db,
  input: { issueId: number; status: "open" | "resolved" | "ignored"; note: string | null; actor: string },
) {
  const reopening = input.status === "open";
  await db
    .update(importWarning)
    .set({
      status: input.status,
      resolvedBy: reopening ? null : input.actor,
      resolvedAt: reopening ? null : new Date(),
      resolutionNote: reopening ? null : input.note,
    })
    .where(eq(importWarning.id, input.issueId));
}

async function assertNotDuplicate(tx: Db, doc: ContagemDocument, ignoreId: number | null) {
  const rows = await tx
    .select({ id: contagem.id })
    .from(contagem)
    .where(
      and(
        eq(contagem.localId, doc.header.localId),
        eq(contagem.date, doc.header.date),
        sql`coalesce(${contagem.variant}, '') = ${doc.header.variant ?? ""}`,
      ),
    );
  const clash = rows.find((r) => r.id !== ignoreId);
  if (clash) throw new DuplicateContagemError(clash.id);
}

type CreateInput = {
  doc: ContagemDocument;
  newLocal: { name: string; latitude: number | null; longitude: number | null } | null;
  author: string;
};

export async function createContagem(db: Db, input: CreateInput) {
  const problems = validateDocument(input.doc);
  if (problems.length > 0) throw new InvalidDocumentError(problems);

  return db.transaction(async (tx) => {
    const doc = structuredClone(input.doc);
    if (input.newLocal) {
      const base = slugify(input.newLocal.name) || "local";
      const taken = new Set(
        (await tx.select({ slug: local.slug }).from(local).where(sql`${local.slug} like ${`${base}%`}`)).map((r) => r.slug),
      );
      let slug = base;
      for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
      const [created] = await tx
        .insert(local)
        .values({ name: input.newLocal.name.trim(), slug, latitude: input.newLocal.latitude, longitude: input.newLocal.longitude })
        .returning({ id: local.id });
      doc.header.localId = created.id;
    }
    await assertNotDuplicate(tx, doc, null);

    const [row] = await tx
      .insert(contagem)
      .values({
        localId: doc.header.localId,
        date: doc.header.date,
        topology: doc.header.topology,
        approaches: doc.approaches,
        bucketMinutes: doc.header.bucketMinutes,
      })
      .returning({ id: contagem.id });
    await writeDocument(tx, row.id, doc, 1);
    await insertRevision(tx, {
      contagemId: row.id,
      version: 1,
      kind: "create",
      author: input.author,
      reason: null,
      changeCount: 0,
      doc,
    });
    await reconcileIssues(tx, row.id, doc);
    return { id: row.id };
  });
}

type SaveInput = {
  id: number;
  expectedVersion: number;
  doc: ContagemDocument;
  author: string;
  reason: string | null;
  kind?: RevisionKind;
  revertedFromVersion?: number;
};

export async function saveDocument(db: Db, input: SaveInput) {
  const problems = validateDocument(input.doc);
  if (problems.length > 0) throw new InvalidDocumentError(problems);

  return db.transaction(async (tx) => {
    // Lock the row so two saves cannot interleave.
    const locked = await tx.execute<{ version: number }>(
      sql`select version from contagem where id = ${input.id} for update`,
    );
    const currentVersion = locked.rows[0]?.version;
    if (currentVersion === undefined) throw new Error(`contagem ${input.id} not found`);
    if (currentVersion !== input.expectedVersion) {
      const [last] = await tx
        .select({ author: contagemRevision.author })
        .from(contagemRevision)
        .where(eq(contagemRevision.contagemId, input.id))
        .orderBy(desc(contagemRevision.version))
        .limit(1);
      throw new VersionConflictError(currentVersion, last?.author ?? null);
    }

    const current = await loadDocument(tx, input.id);
    if (!current) throw new Error(`contagem ${input.id} not found`);
    const changes = diffDocuments(current.doc, input.doc);
    if (changes.length === 0) return { changed: false as const, version: currentVersion, changeCount: 0 };

    await assertNotDuplicate(tx, input.doc, input.id);
    const version = currentVersion + 1;
    await writeDocument(tx, input.id, input.doc, version);
    await reconcileIssues(tx, input.id, input.doc);
    await insertRevision(tx, {
      contagemId: input.id,
      version,
      kind: input.kind ?? "edit",
      author: input.author,
      reason: input.reason,
      revertedFromVersion: input.revertedFromVersion,
      changeCount: changes.length,
      doc: input.doc,
    });
    return { changed: true as const, version, changeCount: changes.length };
  });
}

export async function revertToVersion(
  db: Db,
  input: { id: number; toVersion: number; expectedVersion: number; author: string; reason: string | null },
) {
  const [target] = await db
    .select({ snapshot: contagemRevision.snapshot })
    .from(contagemRevision)
    .where(and(eq(contagemRevision.contagemId, input.id), eq(contagemRevision.version, input.toVersion)));
  if (!target) throw new Error(`revision ${input.toVersion} not found`);
  return saveDocument(db, {
    id: input.id,
    expectedVersion: input.expectedVersion,
    doc: target.snapshot,
    author: input.author,
    reason: input.reason,
    kind: "revert",
    revertedFromVersion: input.toVersion,
  });
}

export async function listRevisions(db: Db, id: number) {
  return db
    .select()
    .from(contagemRevision)
    .where(eq(contagemRevision.contagemId, id))
    .orderBy(desc(contagemRevision.version));
}
