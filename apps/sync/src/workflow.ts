import { withDb } from "@ameciclo/db";
import {
  fetchOverpass,
  infrastructureQuery,
  infrastructureTiles,
  mergeOsm,
  type OsmData,
  PDC_RELATIONS_QUERY,
  waysByIdQuery,
} from "@ameciclo/db/cycling-osm";
import { type SyncSummary, syncCycling } from "@ameciclo/db/cycling-sync";
import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";

import { inWaves } from "./waves";

export type Params = {
  /** Run everything and report, but roll the database back. */
  dryRun?: boolean;
};

// Ways asked for by id in one Overpass query.
const WAYS_PER_QUERY = 400;
// Overpass public instances allow few simultaneous queries per client.
const CONCURRENCY = 2;
// A relation with fewer of its ways than this share fetched means a partial answer.
const MIN_WAYS_SHARE = 0.9;

const FETCH = {
  retries: { limit: 4, delay: "30 seconds", backoff: "exponential" },
  timeout: "10 minutes",
} as const;

type Part = {
  key: string;
  timestamp: string | null;
  endpoint: string;
  relations: number;
  ways: number;
};

/**
 * Brings the cycling infrastructure up to date with OpenStreetMap, weekly.
 *
 * Fetching and writing are separate on purpose. Overpass is the unreliable
 * part, so it is asked in small pieces, each its own step with its own retries,
 * and every answer is kept in R2 (the history of what OSM said, week by week).
 * The database is only touched at the end, by one transaction, with the
 * pieces already validated.
 */
export class CicloSync extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<SyncSummary> {
    const dryRun = event.payload.dryRun ?? false;
    const prefix = `${this.env.ENVIRONMENT}/${event.timestamp.toISOString().slice(0, 10)}/${event.instanceId}`;

    const fetchPart = (name: string, query: string) =>
      step.do(name, FETCH, async (): Promise<Part> => {
        const data = await fetchOverpass(query, { attemptsPerEndpoint: 1, log: console.log });
        const key = `${prefix}/${name}.json`;
        const { endpoint, ...part } = data;
        await this.env.OSM_BUCKET.put(key, JSON.stringify(part), { httpMetadata: { contentType: "application/json" } });
        return { key, timestamp: data.timestamp, endpoint, relations: data.relations.length, ways: data.ways.length };
      });

    // 1. The PDC relations, and with them which ways belong to the plan.
    const relations = await fetchPart("pdc-relacoes", PDC_RELATIONS_QUERY);
    const wayIds = await step.do("pdc-ids-dos-trechos", async () => {
      const data = await this.read(relations.key);
      return [...new Set(data.relations.flatMap((r) => r.wayIds))].sort((a, b) => a - b);
    });

    // 2. Their geometry, a few hundred ways at a time.
    const idChunks = Array.from({ length: Math.ceil(wayIds.length / WAYS_PER_QUERY) }, (_, i) =>
      wayIds.slice(i * WAYS_PER_QUERY, (i + 1) * WAYS_PER_QUERY),
    );
    const pdcWays = await inWaves(idChunks, CONCURRENCY, (ids, i) => fetchPart(`pdc-trechos-${i + 1}`, waysByIdQuery(ids)));

    // 3. Everything with cycling infrastructure, by tile of the RMR.
    const tiles = infrastructureTiles();
    const infra = await inWaves(tiles, CONCURRENCY, (tile, i) => fetchPart(`infra-${i + 1}`, infrastructureQuery(tile)));

    // 4. Is it all here, and recent?
    const manifest = await step.do("validar", async () => {
      const parts = [relations, ...pdcWays, ...infra];
      const gotWays = pdcWays.reduce((sum, p) => sum + p.ways, 0);
      const problems: string[] = [];
      if (relations.relations === 0) problems.push("nenhuma relação do PDC");
      if (gotWays < wayIds.length * MIN_WAYS_SHARE) problems.push(`só ${gotWays} dos ${wayIds.length} trechos do PDC`);
      if (infra.some((p) => p.ways === 0) && infra.every((p) => p.ways === 0)) problems.push("nenhum trecho de infraestrutura");
      if (problems.length > 0) throw new NonRetryableError(`Dados incompletos, nada foi gravado: ${problems.join("; ")}`);

      const manifest = { prefix, dryRun, parts };
      await this.env.OSM_BUCKET.put(`${prefix}/manifest.json`, JSON.stringify(manifest, null, 2), {
        httpMetadata: { contentType: "application/json" },
      });
      return manifest;
    });

    // 5. The only step that writes to the database: one transaction.
    return step.do(
      "aplicar",
      { retries: { limit: 2, delay: "1 minute", backoff: "constant" }, timeout: "20 minutes" },
      async () => {
        // manifest.parts is [relations, ...pdc ways, ...infrastructure tiles].
        const data = await Promise.all(manifest.parts.map((p) => this.read(p.key)));
        const pdcData = mergeOsm(data.slice(0, 1 + pdcWays.length));
        const infrastructureData = mergeOsm(data.slice(1 + pdcWays.length));
        const summary = await withDb(this.env.HYPERDRIVE.connectionString, (db) =>
          syncCycling(db, { pdc: pdcData, infrastructure: infrastructureData }, { triggeredBy: `workflow ${event.instanceId}`, dryRun }),
        );
        await this.env.OSM_BUCKET.put(`${prefix}/resumo.json`, JSON.stringify({ dryRun, ...summary }, null, 2), {
          httpMetadata: { contentType: "application/json" },
        });
        return summary;
      },
    );
  }

  private async read(key: string): Promise<OsmData> {
    const object = await this.env.OSM_BUCKET.get(key);
    if (!object) throw new Error(`R2 não tem ${key}`);
    return object.json<OsmData>();
  }
}
