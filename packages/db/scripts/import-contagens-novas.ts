// Adds counts that are missing from a database that already has data. Unlike
// import-contagens.ts it never truncates anything: places are matched by name and
// reused, new ones are created, and a count that already exists is left alone, so a
// second run is a no-op.
//
//   tsx scripts/import-contagens-novas.ts <dir> [--dry-run] [--publish]
//
// <dir> holds manifest.json and one <fileId>.xlsx per entry. New counts enter as
// drafts (so they can be reviewed in the admin first) unless --publish is passed.
// Every entry carries the total and peak hour the team published; the run aborts
// before writing anything if the parsed workbook disagrees.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { and, eq, isNull } from "drizzle-orm";

import { createInitialRevision, type Db, rowFromDocument, VALIDATION_CODES, withDb } from "../src";
import { characteristicAlias, contagem, importWarning, local } from "../src/schema";
import {
  ALIASES,
  documentFromParsed,
  PARSER_VERSION,
  parseWorkbook,
  placeKey,
  slugify,
  splitVariant,
} from "../src/import";

type Entry = {
  fileId: string;
  title: string;
  // Published total and peak hour, checked against the parsed workbook.
  total: number;
  peak: number;
  // Name for a place that does not exist yet; defaults to the name in the workbook.
  localName?: string;
};

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const publish = args.includes("--publish");
const dirArg = args.find((a) => !a.startsWith("--"));
if (!dirArg) throw new Error("usage: import-contagens-novas.ts <dir> [--dry-run] [--publish]");
const dir = resolve(dirArg);
const manifest: Entry[] = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
const validationCodes = new Set<string>(VALIDATION_CODES);

class DryRun extends Error {}

async function main() {
  await withDb(connectionString!, async (db: Db) => {
    const aliases = {
      ...ALIASES,
      ...Object.fromEntries((await db.select().from(characteristicAlias)).map((a) => [a.alias, a.characteristicKey])),
    };

    const locals = await db.select({ id: local.id, name: local.name, slug: local.slug }).from(local);
    const localByKey = new Map(locals.map((l) => [placeKey(splitVariant(l.name).base), l]));
    const usedSlugs = new Set(locals.map((l) => l.slug));

    // Parse and check everything first: nothing is written if any entry is off.
    const parsedEntries = [];
    for (const entry of manifest) {
      const parsed = await parseWorkbook(readFileSync(join(dir, `${entry.fileId}.xlsx`)), { aliases });
      if (!parsed.date) throw new Error(`${entry.title}: no date in the workbook`);
      if (parsed.totalCyclists !== entry.total || parsed.peakBucketCount !== entry.peak) {
        throw new Error(
          `${entry.title}: workbook says ${parsed.totalCyclists}/${parsed.peakBucketCount} (total/peak), expected ${entry.total}/${entry.peak}`,
        );
      }
      parsedEntries.push({ entry, parsed });
    }

    try {
      await db.transaction(async (tx) => {
        let created = 0;
        let skipped = 0;
        let newLocals = 0;
        let warningCount = 0;
        for (const { entry, parsed } of parsedEntries) {
          const { base, variant } = splitVariant(parsed.name);
          const date = parsed.date!;
          // A place may already exist under the workbook's name or under the shorter name
          // given in the manifest (that is what a previous run stored).
          const keys = [base, ...(entry.localName ? [splitVariant(entry.localName).base] : [])].map(placeKey);
          let place = keys.map((k) => localByKey.get(k)).find((l) => l !== undefined);
          if (!place) {
            const name = entry.localName ?? base;
            let slug = slugify(name);
            for (let i = 2; usedSlugs.has(slug); i++) slug = `${slugify(name)}-${i}`;
            usedSlugs.add(slug);
            const [row] = await tx
              .insert(local)
              .values({ name, slug, latitude: parsed.latitude, longitude: parsed.longitude })
              .returning({ id: local.id, name: local.name, slug: local.slug });
            place = row;
            for (const k of keys) localByKey.set(k, place);
            newLocals++;
            console.log(`new place #${place.id}: ${place.name} (${place.slug})`);
          }

          const already = await tx
            .select({ id: contagem.id })
            .from(contagem)
            .where(
              and(
                eq(contagem.localId, place.id),
                eq(contagem.date, date),
                variant === null ? isNull(contagem.variant) : eq(contagem.variant, variant),
              ),
            );
          if (already.length > 0) {
            console.log(`skip ${date} ${place.name}: already imported as #${already[0].id}`);
            skipped++;
            continue;
          }

          const warnings = parsed.warnings.filter((w) => !validationCodes.has(w.code));
          const doc = documentFromParsed(parsed, { localId: place.id, variant, date, sourceDate: null, dateNote: null });
          const values = rowFromDocument(doc, 1);
          if (values.totalCyclists !== parsed.totalCyclists || values.peakBucketCount !== parsed.peakBucketCount) {
            throw new Error(
              `${entry.title}: document gives ${values.totalCyclists}/${values.peakBucketCount}, parser said ${parsed.totalCyclists}/${parsed.peakBucketCount}`,
            );
          }
          const [row] = await tx
            .insert(contagem)
            .values({
              ...values,
              status: publish ? "published" : "draft",
              source: {
                driveFileId: entry.fileId,
                fileName: entry.title,
                sheetNames: parsed.sheetNames,
                parserVersion: PARSER_VERSION,
                importedAt: new Date().toISOString(),
              },
            })
            .returning({ id: contagem.id });
          if (warnings.length > 0) {
            await tx.insert(importWarning).values(warnings.map((w) => ({ ...w, contagemId: row.id })));
            warningCount += warnings.length;
          }
          await createInitialRevision(tx, row.id, "importação");
          created++;
          console.log(`${publish ? "published" : "draft"} #${row.id}: ${date} ${place.name} (${values.totalCyclists} cyclists, ${warnings.length} warnings)`);
        }
        console.log(`${created} contagens created (${newLocals} new places), ${skipped} already there, ${warningCount} warnings`);
        if (dryRun) throw new DryRun();
      });
    } catch (error) {
      if (!(error instanceof DryRun)) throw error;
      console.log("dry run: everything above was rolled back, nothing was written");
    }
  });
}

try {
  await main();
} catch (error) {
  console.error(String(error).slice(0, 500));
  process.exitCode = 1;
}
