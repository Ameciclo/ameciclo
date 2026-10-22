import { and, desc, eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { relations } from "../relations";
import { slugify } from "../import/locals";
import { characteristic, contagem, contagemRevision, importWarning, local } from "../schema";
import { diffDocuments } from "./diff";
import { detectIssues } from "./issues";
import { bodyOf, summarize } from "./summary";
import type { Basis, ContagemDocument, RevisionKind } from "./types";
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

export async function loadDocument(
  db: Db,
  id: number,
): Promise<{ doc: ContagemDocument; version: number } | null> {
  const row = await db.query.contagem.findFirst({ where: { id } });
  if (!row) return null;

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
    positions: row.approachPositions,
    ...row.data,
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

// Every column a document determines, for both insert and update.
export function rowFromDocument(doc: ContagemDocument, version: number) {
  const h = doc.header;
  const { total, peak } = derivedTotals(doc);
  return {
    localId: h.localId,
    variant: h.variant,
    date: h.date,
    sourceDate: h.sourceDate,
    dateNote: h.dateNote,
    startedAt: h.startedAt,
    endedAt: h.endedAt,
    topology: h.topology,
    approaches: doc.approaches,
    approachPositions: doc.positions ?? null,
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
    data: bodyOf(doc),
    summary: summarize(doc),
    version,
  };
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

    const [row] = await tx.insert(contagem).values(rowFromDocument(doc, 1)).returning({ id: contagem.id });
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
      sql`select version from ${contagem} where id = ${input.id} for update`,
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
    await tx
      .update(contagem)
      .set({ ...rowFromDocument(input.doc, version), updatedAt: new Date() })
      .where(eq(contagem.id, input.id));
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
