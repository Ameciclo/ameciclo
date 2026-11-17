// Brings the cycling infrastructure up to date with OpenStreetMap, weekly.
//
// Asks Overpass for the RMR's cycling network in small pieces (each with its own
// retries), checks that it is all there and recent, and writes it to the database
// in one transaction (packages/db/src/cycling/sync.ts). If R2 is configured, every
// answer is also kept there: the history of what OSM said, week by week.
//
// It runs on the Coolify VPS because Cloudflare's network cannot reach Overpass
// (HTTP 521 and timeouts from Workers, measured 2026-11-17).

import { withDb } from "@ameciclo/db";
import { type Manifest, manifestParts, manifestProblems, type Part } from "@ameciclo/db/cycling-manifest";
import {
  fetchOverpass,
  infrastructureQuery,
  infrastructureTiles,
  mergeOsm,
  type OsmData,
  PDC_RELATIONS_QUERY,
  waysByIdQuery,
} from "@ameciclo/db/cycling-osm";
import { syncCycling } from "@ameciclo/db/cycling-sync";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { r2Client } from "./r2";
import { withRetries } from "./retry";
import { inWaves } from "./waves";

// Ways asked for by id in one Overpass query.
const WAYS_PER_QUERY = 400;
// One query at a time: the public Overpass instances turn away simultaneous
// ones (502 at once), and this runs weekly, so there is no hurry.
const CONCURRENCY = 1;
// Each piece is retried on its own, waiting longer each time (30 s up to 15 min),
// before the run gives up. The public Overpass instances refuse about half of the
// first attempts on a bad day, and a week is a long time to wait for the next run.
const ATTEMPTS = 10;
const MAX_WAIT_MS = 15 * 60_000;
// Whatever happens, the run ends: a stuck night must not hold the VPS for days.
const DEADLINE_MS = 6 * 60 * 60_000;

// Every answer is also kept on disk, so a run that was only a dry run can be
// applied for real afterwards without asking Overpass again (APPLY_SNAPSHOT).
const SNAPSHOT_DIR = process.env.SNAPSHOT_DIR ?? "/tmp/osm-snapshots";
const SNAPSHOT_PREFIX = /^(production|staging)\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{8}$/;

async function saveSnapshot(key: string, value: unknown): Promise<void> {
  const file = join(SNAPSHOT_DIR, key);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value));
}

async function readSnapshot<T>(key: string): Promise<T> {
  return JSON.parse(await readFile(join(SNAPSHOT_DIR, key), "utf8"));
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta a variável ${name}`);
  return value;
}

const log = (message: string) => console.log(`${new Date().toISOString()} ${message}`);

async function main() {
  const environment = required("ENVIRONMENT");
  if (environment !== "production" && environment !== "staging") throw new Error(`ENVIRONMENT inválido: ${environment}`);
  const databaseUrl = required("DATABASE_URL");
  const dryRun = process.env.DRY_RUN === "true";

  // Optional: keep every answer in R2.
  const r2 = process.env.R2_ACCOUNT_ID
    ? r2Client({
        accountId: required("R2_ACCOUNT_ID"),
        accessKeyId: required("R2_ACCESS_KEY_ID"),
        secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
        bucket: process.env.R2_BUCKET ?? "ameciclo-cycling-osm",
      })
    : null;

  const startedAt = Date.now();
  const reuse = process.env.APPLY_SNAPSHOT;
  if (reuse && !(SNAPSHOT_PREFIX.test(reuse) && reuse.startsWith(`${environment}/`))) {
    throw new Error(`APPLY_SNAPSHOT inválido para ${environment}: ${reuse}`);
  }
  const prefix = reuse ?? `${environment}/${new Date().toISOString().slice(0, 10)}/${randomBytes(4).toString("hex")}`;
  log(`${reuse ? "Aplicando o snapshot" : "Coleta"} ${prefix}${dryRun ? " (dry run)" : ""}${r2 ? "" : " (sem R2)"}`);

  let manifest: Manifest;
  let pieces: OsmData[]; // in the order of manifestParts(manifest)

  if (reuse) {
    // Already collected (and checked for freshness below): no Overpass this time.
    manifest = await readSnapshot<Manifest>(`${prefix}/manifest.json`);
    pieces = await Promise.all(manifestParts(manifest).map((part) => readSnapshot<OsmData>(part.key)));
  } else {
    const collect = (name: string, query: string): Promise<Part & { data: OsmData }> =>
      withRetries(
        async () => {
          if (Date.now() > startedAt + DEADLINE_MS) throw new Error("Passou do prazo de 6 horas; a coleta foi abandonada");
          const { endpoint, ...data } = await fetchOverpass(query, { attemptsPerEndpoint: 1, contact: process.env.OVERPASS_CONTACT, log });
          const key = `${prefix}/${name}.json`;
          await saveSnapshot(key, data);
          await r2?.putJson(key, data);
          log(`${name}: ${data.relations.length} relações, ${data.ways.length} trechos (OSM de ${data.timestamp})`);
          return { key, timestamp: data.timestamp, endpoint, relations: data.relations.length, ways: data.ways.length, data };
        },
        { attempts: ATTEMPTS, baseMs: 30_000, maxMs: MAX_WAIT_MS, onError: (error, attempt) => log(`${name}, tentativa ${attempt}: ${error instanceof Error ? error.message : error}`) },
      );
    const withoutData = ({ data: _data, ...part }: Part & { data: OsmData }): Part => part;

    // 1. The PDC relations, and with them which ways belong to the plan.
    const relations = await collect("pdc-relacoes", PDC_RELATIONS_QUERY);
    const wayIds = [...new Set(relations.data.relations.flatMap((r) => r.wayIds))].sort((a, b) => a - b);

    // 2. Their geometry, a few hundred ways at a time.
    const idChunks = Array.from({ length: Math.ceil(wayIds.length / WAYS_PER_QUERY) }, (_, i) =>
      wayIds.slice(i * WAYS_PER_QUERY, (i + 1) * WAYS_PER_QUERY),
    );
    const pdcWays = await inWaves(idChunks, CONCURRENCY, (ids, i) => collect(`pdc-trechos-${i + 1}`, waysByIdQuery(ids)));

    // 3. Everything with cycling infrastructure, by tile of the RMR.
    const infrastructure = await inWaves(infrastructureTiles(), CONCURRENCY, (tile, i) =>
      collect(`infra-${i + 1}`, infrastructureQuery(tile)),
    );

    manifest = {
      version: 1,
      prefix,
      collectedAt: new Date().toISOString(),
      pdcWayIds: wayIds.length,
      relations: withoutData(relations),
      pdcWays: pdcWays.map(withoutData),
      infrastructure: infrastructure.map(withoutData),
    };
    pieces = [relations.data, ...pdcWays.map((p) => p.data), ...infrastructure.map((p) => p.data)];
    await saveSnapshot(`${prefix}/manifest.json`, manifest);
    await r2?.putJson(`${prefix}/manifest.json`, manifest);
    log(`Snapshot guardado em ${join(SNAPSHOT_DIR, prefix)}. Para aplicar de novo sem buscar: APPLY_SNAPSHOT=${prefix} DRY_RUN=false`);
  }

  // 4. All there, and recent? Otherwise nothing is written.
  const problems = manifestProblems(manifest);
  if (problems.length > 0) throw new Error(`Dados incompletos ou velhos, nada foi gravado: ${problems.join("; ")}`);

  // 5. One transaction. The pieces are [relations, ...PDC ways, ...infrastructure tiles].
  const pdc = mergeOsm(pieces.slice(0, 1 + manifest.pdcWays.length));
  const infra = mergeOsm(pieces.slice(1 + manifest.pdcWays.length));
  const summary = await withDb(databaseUrl, (db) =>
    syncCycling(db, { pdc, infrastructure: infra }, { triggeredBy: `coletor ${prefix}`, dryRun }),
  );
  await r2?.putJson(`${prefix}/resumo.json`, { dryRun, ...summary });
  log(`${dryRun ? "Dry run: nada foi gravado. " : ""}${JSON.stringify(summary)}`);
}

// An uptime-kuma push monitor tells someone when a week goes by without a success.
async function heartbeat(status: "up" | "down", message: string) {
  const url = process.env.KUMA_PUSH_URL;
  if (!url) return;
  // The push URL Kuma shows already ends in "?status=up&msg=OK&ping=". Whatever was pasted, drop
  // its query and set our own: a repeated msg turns into a list and Kuma prints "[object Object]".
  const target = new URL(url);
  target.search = "";
  target.searchParams.set("status", status);
  target.searchParams.set("msg", message.slice(0, 200));
  await fetch(target).catch(() => {});
}

main().then(
  // A dry run is not a success of the sync: say so, or a forgotten DRY_RUN=true would look fine for weeks.
  () => heartbeat("up", process.env.DRY_RUN === "true" ? "dry run concluido (nada foi gravado)" : "coleta concluida"),
  async (error) => {
    console.error(error);
    await heartbeat("down", error instanceof Error ? error.message : String(error));
    process.exit(1);
  },
);
