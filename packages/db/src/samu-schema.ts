import { sql } from "drizzle-orm";
import { boolean, date, index, integer, pgTable, smallint, text, time, timestamp } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Chamados do SAMU por sinistro de trânsito
//
// Uma linha por chamado, como veio do SAMU (2018 a 2025). O `source_id` é o
// número do chamado dentro de cada extração e se repete entre elas: nunca é
// chave. Quais chamados entram nas estatísticas (os que tiveram atendimento)
// é regra de leitura, não de gravação: ver VALID_OUTCOMES em ./samu/read.
// ---------------------------------------------------------------------------

// Os municípios que aparecem nos chamados.
export const samuCity = pgTable("samu_city", {
  ibgeCode: integer("ibge_code").primaryKey(),
  name: text("name").notNull(),
  isRmr: boolean("is_rmr").notNull().default(false),
});

export const samuCall = pgTable(
  "samu_call",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // Número do chamado na extração de origem. Repete entre extrações.
    sourceId: integer("source_id").notNull(),
    // Linha do arquivo importado (1 = primeira linha de dados): torna a importação repetível.
    sourceRow: integer("source_row").notNull().unique(),
    occurredOn: date("occurred_on", { mode: "string" }).notNull(),
    occurredAt: time("occurred_at"),
    cityIbge: integer("city_ibge").references(() => samuCity.ibgeCode),
    neighborhood: text("neighborhood"),
    // Endereço como o atendente digitou.
    address: text("address"),
    // Nome do logradouro já corrigido (PCR); vazio quando não foi identificado.
    street: text("street"),
    // Onde o chamado se originou: via pública, residência, unidade de saúde.
    origin: text("origin"),
    // Subtipo no vocabulário do SAMU (ex. ACIDENTMOTO); duas grafias para o mesmo tipo.
    subtype: text("subtype"),
    // Uma das 9 categorias: acidente de moto, atropelamento por carro, ...
    category: text("category").notNull(),
    gender: text("gender"),
    age: smallint("age"),
    // Como o chamado foi encerrado e o que aconteceu com o paciente.
    finalization: text("finalization"),
    outcome: text("outcome"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("samu_call_date_idx").on(t.occurredOn),
    index("samu_call_city_date_idx").on(t.cityIbge, t.occurredOn),
    index("samu_call_street_idx").on(t.cityIbge, t.street).where(sql`${t.street} is not null`),
  ],
);
