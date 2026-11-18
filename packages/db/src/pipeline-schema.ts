import { index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Execuções dos pipelines de dados (coletores e importadores)
//
// Uma linha por execução que gravou (ou tentou gravar) no banco, para a tela "Coletas" do admin responder
// "o que mudou?" sem abrir o log do agendador. O agendador (Dagu) guarda o histórico dos passos; esta
// tabela guarda o estado dos dados: de que versão da fonte veio, quantas linhas entraram e o que foi
// descartado e por quê.
// ---------------------------------------------------------------------------

export const pipelineRun = pgTable(
  "pipeline_run",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // Qual pipeline (ex. "mortes-sim") e qual fatia dele (ex. o ano: "2026").
    pipeline: text("pipeline").notNull(),
    sourceKey: text("source_key").notNull(),
    // "ok" ou "erro".
    status: text("status").notNull(),
    // Da fonte: "final" ou "preliminar", e quando o arquivo foi modificado lá.
    sourceVersion: text("source_version"),
    sourceModifiedAt: timestamp("source_modified_at", { withTimezone: true }),
    rowsRead: integer("rows_read"),
    rowsLoaded: integer("rows_loaded"),
    // Motivo -> quantas linhas foram descartadas por ele.
    discarded: jsonb("discarded").$type<Record<string, number>>(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [index("pipeline_run_pipeline_started_idx").on(t.pipeline, t.startedAt)],
);
