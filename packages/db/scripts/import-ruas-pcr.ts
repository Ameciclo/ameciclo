import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { sql } from "drizzle-orm";

import { type Db, withDb } from "../src";
import { streetSegment } from "../src/schema";
import { type SegmentDraft, type SegmentFeature, toSegment } from "../src/streets/transform";

// Importa os trechos de logradouros do Recife (Prefeitura, dados abertos) para street_segment: dão a extensão
// (km) e o traçado das vias do ranking de vias inseguras.
//
//   pnpm --filter @ameciclo/db db:import-ruas                       lê data/ruas/trechos-de-logradouros.geojson
//   pnpm --filter @ameciclo/db db:import-ruas -- --url https://…    baixa o arquivo de uma URL
//   pnpm --filter @ameciclo/db db:import-ruas -- --dry-run          só lê e relata
//
// A tabela é um retrato do arquivo: cada execução o substitui por inteiro numa transação (desfeita se a contagem
// final não bater). O arquivo (14,5 MB) está git-ignorado em data/ruas/.

try {
  process.loadEnvFile();
} catch {}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const urlArg = args.includes("--url") ? args[args.indexOf("--url") + 1] : undefined;
const connectionString = process.env.DATABASE_URL;
if (!connectionString && !dryRun) throw new Error("DATABASE_URL is not set (packages/db/.env)");
const file = resolve(process.env.RUAS_FILE ?? join(import.meta.dirname, "../../../data/ruas/trechos-de-logradouros.geojson"));
const BATCH = 500;

async function read(): Promise<{ features: SegmentFeature[] }> {
  if (urlArg) {
    const res = await fetch(urlArg, { signal: AbortSignal.timeout(120_000) });
    if (!res.ok) throw new Error(`${urlArg}: HTTP ${res.status}`);
    return res.json();
  }
  return JSON.parse(readFileSync(file, "utf8"));
}

const { features } = await read();
if (!Array.isArray(features) || features.length === 0) throw new Error("o arquivo não tem features");

const drafts: SegmentDraft[] = [];
const skipped: Record<string, number> = {};
const seen = new Set<number>();
for (const f of features) {
  const r = toSegment(f);
  if ("skipped" in r) {
    skipped[r.skipped] = (skipped[r.skipped] ?? 0) + 1;
  } else if (seen.has(r.draft.sourceId)) {
    skipped["OBJECTID repetido"] = (skipped["OBJECTID repetido"] ?? 0) + 1;
  } else {
    seen.add(r.draft.sourceId);
    drafts.push(r.draft);
  }
}
const streets = new Set(drafts.map((d) => d.nameKey)).size;
const km = drafts.reduce((n, d) => n + d.lengthM, 0) / 1000;
console.log(`${drafts.length} de ${features.length} trechos; ${streets} nomes de logradouro; ${km.toFixed(0)} km`);
for (const [reason, n] of Object.entries(skipped)) console.log(`  descartados (${reason}): ${n}`);
if (dryRun) {
  console.log("Dry run: nada foi gravado.");
  process.exit(0);
}

async function load(db: Db) {
  await db.transaction(async (tx) => {
    await tx.delete(streetSegment);
    for (let i = 0; i < drafts.length; i += BATCH) {
      await tx.insert(streetSegment).values(
        drafts.slice(i, i + BATCH).map((d) => ({
          sourceId: d.sourceId,
          streetCode: d.streetCode,
          nameKey: d.nameKey,
          officialName: d.officialName,
          paved: d.paved,
          lengthM: d.lengthM,
          geom: sql`ST_SetSRID(ST_GeomFromGeoJSON(${d.geometry}), 4326)`,
        })),
      );
    }
    const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(streetSegment);
    if (n !== drafts.length) throw new Error(`gravei ${n}, esperava ${drafts.length}`);
  });
}

await withDb(connectionString ?? "", load);
console.log(`${drafts.length} trechos gravados.`);
