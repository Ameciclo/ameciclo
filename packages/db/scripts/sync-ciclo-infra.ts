import { fetchOverpass, INFRASTRUCTURE_QUERY, PDC_QUERY } from "../src/cycling/osm";
import { syncCycling } from "../src/cycling/sync";
import { withDb } from "../src";

// Brings the cycling infrastructure up to date with OpenStreetMap (Overpass).
//
//   pnpm --filter @ameciclo/db db:sync-ciclo-infra              fetch and write
//   pnpm --filter @ameciclo/db db:sync-ciclo-infra -- --dry-run fetch, write, report, roll back
//
// Runs on a schedule in .github/workflows/sync-ciclo-infra.yml. Needs the PDC
// catalog to be in the database already (db:import-ciclo-infra).

try {
  process.loadEnvFile();
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set (packages/db/.env)");
const dryRun = process.argv.includes("--dry-run");

console.log("Consultando o Overpass (relações do PDC)...");
const pdc = await fetchOverpass(PDC_QUERY);
console.log(`  ${pdc.relations.length} relações, ${pdc.ways.length} trechos (OSM de ${pdc.timestamp})`);
console.log("Consultando o Overpass (infraestrutura da RMR)...");
const infrastructure = await fetchOverpass(INFRASTRUCTURE_QUERY);
console.log(`  ${infrastructure.ways.length} trechos (OSM de ${infrastructure.timestamp})`);

const summary = await withDb(connectionString, (db) =>
  syncCycling(db, { pdc, infrastructure }, { triggeredBy: process.env.GITHUB_ACTIONS ? "github actions" : "db:sync-ciclo-infra", dryRun }),
);

console.log(dryRun ? "--dry-run: nada foi gravado" : `Sincronização ${summary.runId} concluída`);
console.log(`trechos: ${summary.added} novos, ${summary.updated} atualizados, ${summary.removed} removidos`);
console.log(`vínculos trecho↔projeto: ${summary.links.added} novos, ${summary.links.removed} removidos`);
if (summary.outsideRmr) console.log(`fora dos 14 municípios (ignorados): ${summary.outsideRmr}`);
if (summary.unknownRelations.length) console.log(`atenção: relações do PDC no OSM que não estão no catálogo: ${summary.unknownRelations.join(", ")}`);
if (summary.missingRelations.length) console.log(`atenção: projetos do catálogo sem relação no OSM: ${summary.missingRelations.join(", ")}`);
