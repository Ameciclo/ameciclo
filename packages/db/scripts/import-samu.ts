import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";

import { type Db, withDb } from "../src";
import { RMR_CITIES } from "../src/cycling/transform";
import { normalizeName, type SamuCallDraft, type SamuRow, toDraft } from "../src/samu/transform";
import { samuCall, samuCity } from "../src/schema";

// Imports the SAMU calls about traffic crashes (2018-2025) from the TSV that the
// atlas used. The file is git-ignored: data/samu/sinistros-samu.tsv.
//
//   pnpm --filter @ameciclo/db db:import-samu              read, clean, write
//   pnpm --filter @ameciclo/db db:import-samu -- --dry-run read and report only
//
// The table is a snapshot of the file, so each run replaces all calls inside one
// transaction (rolled back if the row count afterwards is not what was read).
// Municipalities come from apps/web/public/data/pernambuco-municipios.geojson.

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");

const dryRun = process.argv.includes("--dry-run");
const file = resolve(process.env.SAMU_FILE ?? join(import.meta.dirname, "../../../data/samu/sinistros-samu.tsv"));
const municipalitiesFile = join(import.meta.dirname, "../../../apps/web/public/data/pernambuco-municipios.geojson");
const BATCH = 2000;

type Municipality = { properties: { id: string; name: string } };

const municipalities = (JSON.parse(readFileSync(municipalitiesFile, "utf8")) as { features: Municipality[] }).features.map(
  (f) => ({ ibgeCode: Number(f.properties.id), name: f.properties.name, key: normalizeName(f.properties.name) }),
);
const ibgeByName = new Map(municipalities.map((m) => [m.key, m.ibgeCode]));

console.log(`Reading ${file}`);
// The spreadsheet has no quoting: a quote character is just text.
const rows: SamuRow[] = parse(readFileSync(file, "utf8"), {
  columns: true,
  delimiter: "\t",
  quote: false,
  skip_empty_lines: true,
  relax_column_count: false,
});

const drafts: SamuCallDraft[] = [];
const skipped = new Map<string, number>();
const unknownCities = new Map<string, number>();
for (const [i, raw] of rows.entries()) {
  const result = toDraft(raw, i + 1);
  if ("skipped" in result) {
    skipped.set(result.skipped, (skipped.get(result.skipped) ?? 0) + 1);
    continue;
  }
  const name = result.draft.municipality;
  if (name && !ibgeByName.has(normalizeName(name))) unknownCities.set(name, (unknownCities.get(name) ?? 0) + 1);
  drafts.push(result.draft);
}

const perYear = new Map<string, number>();
for (const d of drafts) perYear.set(d.occurredOn.slice(0, 4), (perYear.get(d.occurredOn.slice(0, 4)) ?? 0) + 1);
console.log(`\nCalls read: ${drafts.length} of ${rows.length} rows`);
for (const [year, n] of [...perYear.entries()].sort()) console.log(`  ${year}: ${n}`);
console.log(`Without city: ${drafts.filter((d) => !d.municipality).length}`);
console.log(`Without age (0, empty or implausible): ${drafts.filter((d) => d.age === null).length}`);
console.log(`Without a street identified: ${drafts.filter((d) => d.street === null).length}`);
for (const [reason, n] of skipped) console.log(`Skipped (${reason}): ${n}`);
for (const [name, n] of unknownCities) console.log(`City not in the municipality list: ${name} (${n})`);

const toRow = (d: SamuCallDraft): typeof samuCall.$inferInsert => ({
  sourceId: d.sourceId,
  sourceRow: d.sourceRow,
  occurredOn: d.occurredOn,
  occurredAt: d.occurredAt,
  cityIbge: d.municipality ? (ibgeByName.get(normalizeName(d.municipality)) ?? null) : null,
  neighborhood: d.neighborhood,
  address: d.address,
  street: d.street,
  origin: d.origin,
  subtype: d.subtype,
  category: d.category,
  gender: d.gender,
  age: d.age,
  finalization: d.finalization,
  outcome: d.outcome,
});

if (dryRun) {
  console.log("\n--dry-run: nothing was written.");
} else {
  await withDb(connectionString, async (db: Db) => {
    await db.transaction(async (tx) => {
      await tx.delete(samuCall);

      const used = new Set(drafts.map((d) => (d.municipality ? ibgeByName.get(normalizeName(d.municipality)) : undefined)));
      await tx
        .insert(samuCity)
        .values(
          municipalities
            .filter((m) => used.has(m.ibgeCode))
            .map((m) => ({ ibgeCode: m.ibgeCode, name: m.name, isRmr: RMR_CITIES.includes(m.ibgeCode) })),
        )
        .onConflictDoUpdate({
          target: samuCity.ibgeCode,
          set: { name: sql`excluded.name`, isRmr: sql`excluded.is_rmr` },
        });

      for (let i = 0; i < drafts.length; i += BATCH) {
        await tx.insert(samuCall).values(drafts.slice(i, i + BATCH).map(toRow));
      }

      const [{ n }] = (await tx.execute<{ n: number }>(sql`select count(*)::int as n from samu_call`)).rows;
      if (n !== drafts.length) throw new Error(`Row count mismatch: wrote ${drafts.length}, table has ${n}`);
      console.log(`\nWrote ${n} calls.`);
    });
  });
}
