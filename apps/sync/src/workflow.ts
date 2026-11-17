import { withDb } from "@ameciclo/db";
import { type Manifest, manifestParts, manifestProblems } from "@ameciclo/db/cycling-manifest";
import { mergeOsm, type OsmData } from "@ameciclo/db/cycling-osm";
import { type SyncSummary, syncCycling } from "@ameciclo/db/cycling-sync";
import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";

export type Params = {
  /** Where the collector left the snapshot in R2, e.g. "production/2026-11-17/abc123". */
  prefix: string;
  /** Run everything and report, but roll the database back. */
  dryRun?: boolean;
};

/**
 * Applies a snapshot of OpenStreetMap to the database.
 *
 * The snapshot is made elsewhere: Cloudflare's network cannot reach Overpass,
 * so the collector (apps/collector, on the VPS) asks it in small pieces, leaves
 * them in R2 with a manifest, and starts this Workflow. Here the manifest is
 * checked (all the pieces, and recent) and then one transaction writes it.
 * R2 keeps the history of what OSM said, week by week.
 */
export class CicloSync extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<SyncSummary> {
    const { prefix, dryRun = false } = event.payload;
    if (!prefix.startsWith(`${this.env.ENVIRONMENT}/`)) {
      throw new NonRetryableError(`O prefixo ${prefix} não é do ambiente ${this.env.ENVIRONMENT}`);
    }

    const manifest = await step.do("validar", async () => {
      const manifest = await this.readJson<Manifest>(`${prefix}/manifest.json`);
      const problems = manifestProblems(manifest);
      if (problems.length > 0) {
        throw new NonRetryableError(`Dados incompletos ou velhos, nada foi gravado: ${problems.join("; ")}`);
      }
      return manifest;
    });

    // The only step that writes to the database: one transaction.
    return step.do(
      "aplicar",
      { retries: { limit: 2, delay: "1 minute", backoff: "constant" }, timeout: "20 minutes" },
      async () => {
        const data = await Promise.all(manifestParts(manifest).map((p) => this.readJson<OsmData>(p.key)));
        const pdc = mergeOsm(data.slice(0, 1 + manifest.pdcWays.length));
        const infrastructure = mergeOsm(data.slice(1 + manifest.pdcWays.length));

        const summary = await withDb(this.env.HYPERDRIVE.connectionString, (db) =>
          syncCycling(db, { pdc, infrastructure }, { triggeredBy: `workflow ${event.instanceId}`, dryRun }),
        );
        await this.env.OSM_BUCKET.put(`${prefix}/resumo.json`, JSON.stringify({ dryRun, ...summary }, null, 2), {
          httpMetadata: { contentType: "application/json" },
        });
        return summary;
      },
    );
  }

  private async readJson<T>(key: string): Promise<T> {
    const object = await this.env.OSM_BUCKET.get(key);
    if (!object) throw new Error(`R2 não tem ${key}`);
    return object.json<T>();
  }
}
