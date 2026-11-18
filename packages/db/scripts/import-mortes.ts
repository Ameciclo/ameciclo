import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";

import { type Db, withDb } from "../src";
import { type DeathDraft, toDraft } from "../src/deaths/transform";
import { pipelineRun, trafficDeath } from "../src/schema";

// Importa os óbitos por acidente de transporte do SIM/DATASUS (2011 em diante) para a RMR, a partir dos CSVs
// anuais mortes_transito_AAAA.csv (e o manifest_AAAA.json ao lado, se houver).
//
//   pnpm --filter @ameciclo/db db:import-mortes                    todos os anos da pasta
//   pnpm --filter @ameciclo/db db:import-mortes -- --ano 2026      só um ano
//   pnpm --filter @ameciclo/db db:import-mortes -- --dry-run       só lê e relata
//
// Pasta: MORTES_DIR (padrão data/mortes, git-ignorada). Cada ano é substituído por inteiro numa transação
// (desfeita se a contagem final não bater) e deixa uma linha em pipeline_run, com o que entrou e o que foi
// descartado e por quê. As execuções com erro também ficam registradas.

try {
  process.loadEnvFile();
} catch {}

const PIPELINE = "mortes-sim";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyYear = args.includes("--ano") ? Number(args[args.indexOf("--ano") + 1]) : undefined;
// O banco só é preciso para gravar: o dry-run só lê e relata.
const connectionString = process.env.DATABASE_URL;
if (!connectionString && !dryRun) throw new Error("DATABASE_URL is not set (packages/db/.env)");
const dir = resolve(process.env.MORTES_DIR ?? join(import.meta.dirname, "../../../data/mortes"));
const csvOf = (year: number) => join(dir, `mortes_transito_${year}.csv`);
const years = Array.from({ length: new Date().getFullYear() - 2010 }, (_, i) => 2011 + i).filter(
  (y) => (onlyYear === undefined || y === onlyYear) && existsSync(csvOf(y)),
);
if (years.length === 0) throw new Error(`nenhum arquivo mortes_transito_AAAA.csv em ${dir}${onlyYear ? ` para ${onlyYear}` : ""}`);
const BATCH = 2000;

type Manifest = { versao?: string; modificado_ftp?: string };
const manifestOf = (year: number): Manifest => {
  const file = join(dir, `manifest_${year}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
};

type Prepared = { year: number; drafts: DeathDraft[]; rowsRead: number; discarded: Record<string, number> };
const prepared: Prepared[] = [];
for (const year of years) {
  const rows: Record<string, string>[] = parse(readFileSync(csvOf(year), "utf8"), { columns: true, skip_empty_lines: true });
  const drafts: DeathDraft[] = [];
  const discarded: Record<string, number> = {};
  for (const raw of rows) {
    const result = toDraft(raw);
    if ("skipped" in result) discarded[result.skipped] = (discarded[result.skipped] ?? 0) + 1;
    else drafts.push(result.draft);
  }
  // O arquivo de um ano só pode ter óbitos daquele ano.
  const wrongYear = drafts.filter((d) => d.year !== year).length;
  if (wrongYear > 0) console.warn(`  ${year}: ${wrongYear} óbitos com ano diferente do arquivo (guardados com o ano do óbito)`);
  prepared.push({ year, drafts, rowsRead: rows.length, discarded });
  console.log(`${year}: ${drafts.length} de ${rows.length} linhas  (descartadas: ${Object.entries(discarded).map(([k, n]) => `${k} ${n}`).join("; ")})`);
}

console.log(`\nTotal: ${prepared.reduce((n, p) => n + p.drafts.length, 0)} óbitos`);
if (dryRun) {
  console.log("Dry run: nada foi gravado.");
  process.exit(0);
}

async function load(db: Db, p: Prepared) {
  await db.transaction(async (tx) => {
    await tx.delete(trafficDeath).where(sql`${trafficDeath.sourceYear} = ${p.year}`);
    for (let i = 0; i < p.drafts.length; i += BATCH) {
      await tx.insert(trafficDeath).values(p.drafts.slice(i, i + BATCH).map((d, j) => ({ ...d, sourceYear: p.year, sourceRow: i + j + 1 })));
    }
    const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(trafficDeath).where(sql`${trafficDeath.sourceYear} = ${p.year}`);
    if (n !== p.drafts.length) throw new Error(`${p.year}: gravei ${n}, esperava ${p.drafts.length}`);
  });
}

let failed = false;
await withDb(connectionString ?? "", async (db) => {
  for (const p of prepared) {
    const startedAt = new Date();
    const manifest = manifestOf(p.year);
    const run = {
      pipeline: PIPELINE,
      sourceKey: String(p.year),
      sourceVersion: manifest.versao ?? null,
      sourceModifiedAt: manifest.modificado_ftp ? new Date(manifest.modificado_ftp) : null,
      rowsRead: p.rowsRead,
      discarded: p.discarded,
      startedAt,
    };
    try {
      await load(db, p);
      await db.insert(pipelineRun).values({ ...run, status: "ok", rowsLoaded: p.drafts.length, finishedAt: new Date() });
      // Só agora a versão da fonte conta como importada: é com ela que o passo de baixar decide se há novidade.
      if (existsSync(join(dir, `manifest_${p.year}.json`))) copyFileSync(join(dir, `manifest_${p.year}.json`), join(dir, `importado_${p.year}.json`));
      console.log(`${p.year}: ${p.drafts.length} óbitos gravados.`);
    } catch (error) {
      failed = true;
      console.error(`${p.year}: falhou:`, error);
      await db.insert(pipelineRun).values({ ...run, status: "erro", rowsLoaded: 0, error: String(error), finishedAt: new Date() });
    }
  }
});
if (failed) process.exit(1);
console.log("Importação concluída.");
