import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";

import { withDb } from "../src";
import { type DeathDraft, toDraft } from "../src/deaths/transform";
import { trafficDeath } from "../src/schema";

// Importa os óbitos por acidente de transporte do SIM/DATASUS (2011-2023) para a RMR, a partir dos CSVs
// anuais mortes_transito_AAAA.csv (git-ignorados: data/mortes/).
//
//   pnpm --filter @ameciclo/db db:import-mortes              lê, limpa e grava
//   pnpm --filter @ameciclo/db db:import-mortes -- --dry-run só lê e relata
//
// Cada ano é substituído por inteiro numa transação (desfeita se a contagem final não bater).

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");

const dryRun = process.argv.includes("--dry-run");
const dir = resolve(process.env.MORTES_DIR ?? join(import.meta.dirname, "../../../data/mortes"));
const YEARS = Array.from({ length: 13 }, (_, i) => 2011 + i);
const BATCH = 2000;

const perYear = new Map<number, DeathDraft[]>();
for (const year of YEARS) {
  const file = join(dir, `mortes_transito_${year}.csv`);
  const rows: Record<string, string>[] = parse(readFileSync(file, "utf8"), { columns: true, skip_empty_lines: true });
  const drafts: DeathDraft[] = [];
  const skipped = new Map<string, number>();
  for (const raw of rows) {
    const result = toDraft(raw);
    if ("skipped" in result) skipped.set(result.skipped, (skipped.get(result.skipped) ?? 0) + 1);
    else drafts.push(result.draft);
  }
  // O arquivo de um ano só pode ter óbitos daquele ano.
  const wrongYear = drafts.filter((d) => d.year !== year).length;
  if (wrongYear > 0) console.warn(`  ${year}: ${wrongYear} óbitos com ano diferente do arquivo (guardados com o ano do óbito)`);
  perYear.set(year, drafts);
  console.log(`${year}: ${drafts.length} de ${rows.length} linhas  (descartadas: ${[...skipped].map(([k, n]) => `${k} ${n}`).join("; ")})`);
}

const total = [...perYear.values()].reduce((n, d) => n + d.length, 0);
console.log(`\nTotal: ${total} óbitos`);
if (dryRun) {
  console.log("Dry run: nada foi gravado.");
  process.exit(0);
}

await withDb(connectionString, async (db) => {
  await db.transaction(async (tx) => {
    for (const [year, drafts] of perYear) {
      await tx.delete(trafficDeath).where(sql`${trafficDeath.sourceYear} = ${year}`);
      for (let i = 0; i < drafts.length; i += BATCH) {
        await tx.insert(trafficDeath).values(
          drafts.slice(i, i + BATCH).map((d, j) => ({ ...d, sourceYear: year, sourceRow: i + j + 1 })),
        );
      }
      const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(trafficDeath).where(sql`${trafficDeath.sourceYear} = ${year}`);
      if (n !== drafts.length) throw new Error(`${year}: gravei ${n}, esperava ${drafts.length}`);
    }
  });
});
console.log("Importação concluída.");
