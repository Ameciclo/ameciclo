import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { sql } from "drizzle-orm";

import { createInitialRevision, type Db, seedDictionary, VALIDATION_CODES, withDb } from "../src";
import {
  characteristicAlias,
  condition,
  contagem,
  contagemRevision,
  importWarning,
  local,
  movementCount,
  note,
  observation,
} from "../src/schema";
import {
  ALIASES,
  type ParsedContagem,
  PARSER_VERSION,
  parseWorkbook,
  placeKey,
  slugify,
  splitVariant,
} from "../src/import";

type ManifestEntry = { fileId: string; title: string; folder: string };

// Corrections where the spreadsheet disagrees with every other source.
const DATE_OVERRIDES: Record<string, { date: string; note: string }> = {
  "1cTNSS1P8ZSIz3wNkcVLDWt0w1-0NqDRuvRk8GkEJIsE": {
    date: "2013-04-25",
    note: "Spreadsheet says 2013-03-25; the report text (rain on 25 April, 'abril de 2013') and the two other points counted that day say 2013-04-25.",
  },
};

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");

const reset = process.argv.includes("--reset");
const discardEdits = process.argv.includes("--discard-edits");
const dryRun = process.argv.includes("--dry-run");
const validationCodes = new Set<string>(VALIDATION_CODES);
const dir = resolve(process.env.CONTAGENS_DIR ?? join(import.meta.dirname, "../../../data/contagens"));
const manifest: ManifestEntry[] = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));

const pad = (n: number) => String(n).padStart(2, "0");
const chunk = <T>(rows: T[], size = 2000): T[][] =>
  Array.from({ length: Math.ceil(rows.length / size) }, (_, i) => rows.slice(i * size, (i + 1) * size));

async function main() {
  await withDb(connectionString!, async (db: Db) => {
    const existing = await db.$count(contagem);
    if (existing > 0 && !reset) {
      throw new Error(`${existing} contagens already imported; pass --reset to re-import`);
    }

    const dbAliases = Object.fromEntries(
      (await db.select().from(characteristicAlias)).map((a) => [a.alias, a.characteristicKey]),
    );
    const aliases = { ...ALIASES, ...dbAliases };

    type Item = { entry: ManifestEntry; parsed: ParsedContagem; titleDate: string | null };
    const items: Item[] = [];
    const skipped: string[] = [];
    for (const entry of manifest) {
      const file = join(dir, `${entry.fileId}.xlsx`);
      if (!existsSync(file)) {
        skipped.push(`${entry.title} (not downloaded)`);
        continue;
      }
      const parsed = await parseWorkbook(readFileSync(file), { aliases });
      const m = entry.title.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
      items.push({ entry, parsed, titleDate: m ? `${m[1]}-${m[2]}-${m[3]}` : null });
    }

    // Folders sometimes hold both a native Sheet and an uploaded .xlsx copy, with
    // slightly different names. Same date, totals and approaches means same count.
    const placeFrequency = new Map<string, number>();
    for (const { parsed } of items) {
      const k = placeKey(splitVariant(parsed.name).base);
      placeFrequency.set(k, (placeFrequency.get(k) ?? 0) + 1);
    }
    const byCount = new Map<string, Item[]>();
    for (const item of items) {
      const p = item.parsed;
      const key = [p.date, p.totalCyclists, p.peakBucketCount, [...p.approaches].sort().join("/")].join("|");
      byCount.set(key, [...(byCount.get(key) ?? []), item]);
    }
    const unique: Item[] = [];
    for (const copies of byCount.values()) {
      const best = [...copies].sort((a, b) => {
        const score = (i: Item) =>
          (placeFrequency.get(placeKey(splitVariant(i.parsed.name).base)) ?? 0) - (/[[\]]/.test(i.parsed.name) ? 100 : 0);
        return score(b) - score(a);
      })[0];
      unique.push(best);
      for (const c of copies) if (c !== best) skipped.push(`${c.entry.title} (duplicate of ${best.entry.fileId})`);
    }
    unique.sort((a, b) => (a.parsed.date ?? "").localeCompare(b.parsed.date ?? ""));

    // The same set of approach labels at different places on the same day usually
    // means a sheet was copied from another count without renaming them.
    const byLabels = new Map<string, Item[]>();
    for (const item of unique) {
      const key = `${item.parsed.date}|${[...item.parsed.approaches].sort().join("/")}`;
      byLabels.set(key, [...(byLabels.get(key) ?? []), item]);
    }
    for (const group of byLabels.values()) {
      const places = new Set(group.map((i) => placeKey(splitVariant(i.parsed.name).base)));
      if (places.size < 2) continue;
      for (const item of group) {
        // Two neighbouring intersections often share neighbourhood labels; three or more
        // identical sets on one day is far more likely a copied sheet.
        item.parsed.warnings.push({
          severity: places.size >= 3 ? "warning" : "info",
          code: "approach_labels_reused",
          message: `Approach labels (${item.parsed.approaches.join(", ")}) are identical at ${places.size} different places on this date; check they were renamed for this intersection`,
        });
      }
    }

    if (reset && !discardEdits) {
      const [edited] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(contagemRevision)
        .where(sql`${contagemRevision.kind} <> 'import'`);
      if (edited.n > 0) {
        throw new Error(
          `${edited.n} revisions were made after the import (edits, creations or reverts); --reset would delete them. Pass --discard-edits only if you really want that.`,
        );
      }
    }

    if (dryRun) {
      const places = new Set(unique.map((i) => placeKey(splitVariant(i.parsed.name).base) || i.parsed.name));
      console.log(`dry run: would import ${unique.length} contagens at ${places.size} locals (${skipped.length} skipped); nothing written`);
      return;
    }

    await db.transaction(async (tx) => {
      if (reset) {
        await tx.execute(sql`truncate table contagem, local restart identity cascade`);
      }

      await seedDictionary(tx);

      const groups = new Map<string, Item[]>();
      for (const item of unique) {
        const key = placeKey(splitVariant(item.parsed.name).base) || item.parsed.name;
        groups.set(key, [...(groups.get(key) ?? []), item]);
      }

      const usedSlugs = new Set<string>();
      const localIds = new Map<string, number>();
      for (const [key, group] of groups) {
        const latest = [...group].sort((a, b) => (b.parsed.date ?? "").localeCompare(a.parsed.date ?? ""))[0];
        const name = splitVariant(latest.parsed.name).base;
        let slug = slugify(name);
        for (let i = 2; usedSlugs.has(slug); i++) slug = `${slugify(name)}-${i}`;
        usedSlugs.add(slug);
        const withCoords = group.find((g) => g.parsed.latitude !== null);
        const [row] = await tx
          .insert(local)
          .values({
            name,
            slug,
            latitude: withCoords?.parsed.latitude ?? null,
            longitude: withCoords?.parsed.longitude ?? null,
          })
          .returning({ id: local.id });
        localIds.set(key, row.id);
      }

      let warningCount = 0;
      for (const { entry, parsed, titleDate } of unique) {
        const { base, variant } = splitVariant(parsed.name);
        const override = DATE_OVERRIDES[entry.fileId];
        const date = override?.date ?? parsed.date;
        if (!date) {
          console.warn(`skip ${entry.title}: no date`);
          continue;
        }
        // Checks that depend only on the document are recomputed by reconcileIssues.
        const warnings = parsed.warnings.filter((w) => !validationCodes.has(w.code));
        if (override) {
          warnings.push({ severity: "info", code: "date_corrected", message: override.note });
        } else if (titleDate && parsed.date && titleDate !== parsed.date) {
          warnings.push({
            severity: "warning",
            code: "date_mismatch",
            message: `File name says ${titleDate}, Resumo says ${parsed.date}`,
          });
        }

        const endHour = parsed.startHour + (parsed.bucketCount * parsed.bucketMinutes) / 60;
        const [row] = await tx
          .insert(contagem)
          .values({
            localId: localIds.get(placeKey(base) || parsed.name)!,
            variant,
            date,
            sourceDate: override ? parsed.date : null,
            dateNote: override?.note ?? null,
            startedAt: `${pad(parsed.startHour)}:00:00`,
            endedAt: `${pad(Math.floor(endHour))}:00:00`,
            topology: parsed.topology,
            approaches: parsed.approaches,
            bucketMinutes: parsed.bucketMinutes,
            observedBuckets: parsed.observedBuckets,
            isProjected: parsed.isProjected,
            reportUrl: parsed.reportUrl,
            layout: parsed.layout,
            totalCyclists: parsed.totalCyclists,
            peakBucketCount: parsed.peakBucketCount,
            source: {
              driveFileId: entry.fileId,
              fileName: entry.title,
              sheetNames: parsed.sheetNames,
              parserVersion: PARSER_VERSION,
              importedAt: new Date().toISOString(),
            },
          })
          .returning({ id: contagem.id });
        const contagemId = row.id;

        for (const rows of chunk(
          parsed.movements.map((m) => ({
            contagemId,
            basis: m.basis,
            fromIdx: m.from,
            toIdx: m.to,
            bucket: m.bucket,
            value: m.value,
          })),
        )) {
          await tx.insert(movementCount).values(rows);
        }
        for (const rows of chunk(parsed.observations.map((o) => ({ ...o, contagemId })))) {
          await tx.insert(observation).values(rows);
        }
        if (parsed.conditions.length > 0) {
          await tx.insert(condition).values(parsed.conditions.map((c) => ({ ...c, contagemId })));
        }
        if (parsed.notes.length > 0) {
          await tx.insert(note).values(parsed.notes.map((n) => ({ ...n, contagemId })));
        }
        if (warnings.length > 0) {
          await tx.insert(importWarning).values(warnings.map((w) => ({ ...w, contagemId })));
          warningCount += warnings.length;
        }
        await createInitialRevision(tx, contagemId, "importação");
      }

      console.log(
        `imported ${unique.length} contagens at ${groups.size} locals, ${warningCount} warnings`,
      );
    });

    if (skipped.length > 0) console.log(`skipped ${skipped.length}:\n  ${skipped.join("\n  ")}`);
  });
}

try {
  await main();
} catch (error) {
  console.error(String(error).slice(0, 300));
  process.exitCode = 1;
}
