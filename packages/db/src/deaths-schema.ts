import { index, integer, pgTable, smallint, text, timestamp, unique } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Mortes no trânsito (DATASUS / SIM)
//
// Uma linha por óbito por acidente de transporte (CID-10 V01 a V99) em que o município de ocorrência
// ou o de residência está na Região Metropolitana do Recife, de 2011 a 2023. Só o necessário para as
// estatísticas: ano e mês (sem dia, hora, nascimento nem ocupação). Os códigos de município são os do
// SIM, com 6 dígitos (o IBGE sem o dígito verificador). Os códigos de sexo, raça/cor e local de
// ocorrência são os do SIM; traduzi-los é regra de leitura (ver ./deaths/read).
// ---------------------------------------------------------------------------

export const trafficDeath = pgTable(
  "traffic_death",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // Ano do arquivo e linha dentro dele (1 = primeira linha de dados): torna a importação repetível.
    sourceYear: smallint("source_year").notNull(),
    sourceRow: integer("source_row").notNull(),
    year: smallint("year").notNull(),
    month: smallint("month").notNull(),
    occurrenceCity: integer("occurrence_city"),
    residenceCity: integer("residence_city"),
    // Local onde a pessoa morreu: 1 hospital, 2 outro estabelecimento de saúde, 3 domicílio, 4 via pública, 5 outros.
    deathPlace: text("death_place"),
    // Causa básica, CID-10 sem asterisco (ex. V234). As letras V0 a V8 dão o modo de transporte.
    cause: text("cause").notNull(),
    // Linhas A a D e II da declaração de óbito (causas secundárias), separadas por espaço.
    secondaryCauses: text("secondary_causes"),
    sex: text("sex"),
    raceColor: text("race_color"),
    // Idade em anos completos; vazio quando ignorada ou menor de 1 ano.
    ageYears: smallint("age_years"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("traffic_death_source_unique").on(t.sourceYear, t.sourceRow),
    index("traffic_death_year_occurrence_idx").on(t.year, t.occurrenceCity),
    index("traffic_death_year_residence_idx").on(t.year, t.residenceCity),
  ],
);
