import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

// Execuções dos pipelines de dados (coletores e importadores). Datas como texto ISO, para atravessar o servidor.

export type ColetaRun = {
  id: number;
  pipeline: string;
  sourceKey: string;
  status: string;
  sourceVersion: string | null;
  sourceModifiedAt: string | null;
  rowsRead: number | null;
  rowsLoaded: number | null;
  discarded: Record<string, number> | null;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
};

export type ColetaSummary = {
  pipeline: string;
  lastRunAt: string;
  lastStatus: string;
  lastOkAt: string | null;
  runs: number;
  failures: number;
};

const iso = (d: Date | string | null) => (d === null ? null : new Date(d).toISOString());

export const getColetasFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ runs: ColetaRun[]; summary: ColetaSummary[] }> => {
    const { withDb } = await import("~/lib/db.server");
    const { listPipelineRuns, summarizePipelines } = await import("@ameciclo/db/pipeline-read");
    return withDb(async (db) => {
      const [runs, summary] = await Promise.all([listPipelineRuns(db, 100), summarizePipelines(db)]);
      return {
        runs: runs.map((r) => ({
          ...r,
          sourceModifiedAt: iso(r.sourceModifiedAt),
          startedAt: new Date(r.startedAt).toISOString(),
          finishedAt: iso(r.finishedAt),
        })),
        summary: summary.map((s) => ({
          ...s,
          lastRunAt: new Date(s.lastRunAt).toISOString(),
          lastOkAt: iso(s.lastOkAt),
        })),
      };
    });
  },
);

export const coletasQueryOptions = () => queryOptions({ queryKey: ["coletas"], queryFn: () => getColetasFn() });
