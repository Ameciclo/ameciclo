// Asks Overpass for the cycling network of the RMR, in small pieces, keeps each
// answer in R2 and then tells the sync Workflow (apps/sync) to apply them.
//
// It runs on the Coolify VPS, weekly, because Cloudflare's network cannot reach
// Overpass (HTTP 521 / timeouts from Workers). Everything here only makes
// outbound calls.

import type { Manifest, Part } from "@ameciclo/db/cycling-manifest";
import {
  fetchOverpass,
  infrastructureQuery,
  infrastructureTiles,
  type OsmData,
  PDC_RELATIONS_QUERY,
  waysByIdQuery,
} from "@ameciclo/db/cycling-osm";
import { randomBytes } from "node:crypto";

import { r2Client } from "./r2";
import { withRetries } from "./retry";
import { inWaves } from "./waves";

// Ways asked for by id in one Overpass query.
const WAYS_PER_QUERY = 400;
// Public Overpass instances allow few simultaneous queries per client.
const CONCURRENCY = 2;
// Each piece is retried on its own, a few minutes apart, before the run gives up.
const ATTEMPTS = 6;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta a variável ${name}`);
  return value;
}

const log = (message: string) => console.log(`${new Date().toISOString()} ${message}`);

async function main() {
  const environment = required("ENVIRONMENT");
  if (environment !== "production" && environment !== "staging") throw new Error(`ENVIRONMENT inválido: ${environment}`);
  const dryRun = process.env.DRY_RUN === "true";
  const syncUrl = required("SYNC_URL").replace(/\/$/, "");
  const syncToken = required("SYNC_TOKEN");
  const r2 = r2Client({
    accountId: required("R2_ACCOUNT_ID"),
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    bucket: process.env.R2_BUCKET ?? "ameciclo-cycling-osm",
  });

  const prefix = `${environment}/${new Date().toISOString().slice(0, 10)}/${randomBytes(4).toString("hex")}`;
  log(`Coleta ${prefix}${dryRun ? " (dry run)" : ""}`);

  const collect = (name: string, query: string): Promise<Part & { data: OsmData }> =>
    withRetries(
      async () => {
        const { endpoint, ...data } = await fetchOverpass(query, { attemptsPerEndpoint: 1, log });
        const key = `${prefix}/${name}.json`;
        await r2.putJson(key, data);
        log(`${name}: ${data.relations.length} relações, ${data.ways.length} trechos (OSM de ${data.timestamp})`);
        return { key, timestamp: data.timestamp, endpoint, relations: data.relations.length, ways: data.ways.length, data };
      },
      { attempts: ATTEMPTS, baseMs: 30_000, onError: (error, attempt) => log(`${name}, tentativa ${attempt}: ${error instanceof Error ? error.message : error}`) },
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

  const manifest: Manifest = {
    version: 1,
    prefix,
    collectedAt: new Date().toISOString(),
    pdcWayIds: wayIds.length,
    relations: withoutData(relations),
    pdcWays: pdcWays.map(withoutData),
    infrastructure: infrastructure.map(withoutData),
  };
  await r2.putJson(`${prefix}/manifest.json`, manifest);
  log("Manifesto gravado");

  // 4. Ask the Workflow to apply what is now in R2.
  const response = await fetch(`${syncUrl}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${syncToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix, dryRun }),
  });
  if (!response.ok) throw new Error(`Workflow não iniciou: HTTP ${response.status} ${await response.text()}`);
  log(`Workflow iniciado: ${await response.text()}`);
}

// An uptime-kuma push monitor tells someone when a week goes by without a success.
async function heartbeat(status: "up" | "down", message: string) {
  const url = process.env.KUMA_PUSH_URL;
  if (!url) return;
  await fetch(`${url}?status=${status}&msg=${encodeURIComponent(message.slice(0, 200))}`).catch(() => {});
}

main().then(
  () => heartbeat("up", "coleta concluída"),
  async (error) => {
    console.error(error);
    await heartbeat("down", error instanceof Error ? error.message : String(error));
    process.exit(1);
  },
);
