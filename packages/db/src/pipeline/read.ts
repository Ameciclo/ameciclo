import { desc, sql } from "drizzle-orm";

import type { Db } from "../index";
import { pipelineRun } from "../schema";

export type PipelineRun = typeof pipelineRun.$inferSelect;

/** As execuções mais recentes, de qualquer pipeline. */
export async function listPipelineRuns(db: Db, limit = 50): Promise<PipelineRun[]> {
  return db.select().from(pipelineRun).orderBy(desc(pipelineRun.startedAt)).limit(limit);
}

export type PipelineSummary = {
  pipeline: string;
  lastRunAt: Date;
  lastStatus: string;
  lastOkAt: Date | null;
  runs: number;
  failures: number;
};

/** Um resumo por pipeline: a última execução, a última que deu certo e quantas falharam. */
export async function summarizePipelines(db: Db): Promise<PipelineSummary[]> {
  const rows = await db
    .select({
      pipeline: pipelineRun.pipeline,
      lastRunAt: sql<Date>`max(${pipelineRun.startedAt})`,
      lastOkAt: sql<Date | null>`max(${pipelineRun.startedAt}) filter (where ${pipelineRun.status} = 'ok')`,
      runs: sql<number>`count(*)::int`,
      failures: sql<number>`count(*) filter (where ${pipelineRun.status} = 'erro')::int`,
    })
    .from(pipelineRun)
    .groupBy(pipelineRun.pipeline);

  const latest = await db
    .selectDistinctOn([pipelineRun.pipeline], { pipeline: pipelineRun.pipeline, status: pipelineRun.status })
    .from(pipelineRun)
    .orderBy(pipelineRun.pipeline, desc(pipelineRun.startedAt));
  const status = new Map(latest.map((l) => [l.pipeline, l.status]));

  return rows.map((r) => ({ ...r, lastStatus: status.get(r.pipeline) ?? "ok" }));
}
