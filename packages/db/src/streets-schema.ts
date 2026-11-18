import { customType, doublePrecision, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Malha viária do Recife (trechos de logradouros da Prefeitura, PCR)
//
// Um trecho por linha, como a Prefeitura publica ("Trechos de Logradouros", dados abertos). Serve para dar
// extensão (km) e traçado às vias dos chamados do SAMU: o ranking de vias inseguras soma o comprimento dos
// trechos de cada logradouro. É um retrato do arquivo: cada importação substitui tudo.
// ---------------------------------------------------------------------------

// PostGIS geometry in EPSG:4326 (ver cycling-schema). Leitura: ST_AsGeoJSON(col). Escrita:
// sql`ST_SetSRID(ST_GeomFromGeoJSON(${json}), 4326)`.
const multiLine = (name: string) => customType<{ data: string }>({ dataType: () => "geometry(MultiLineString, 4326)" })(name);

export const streetSegment = pgTable(
  "street_segment",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // OBJECTID do arquivo da Prefeitura: torna a importação repetível.
    sourceId: integer("source_id").notNull().unique(),
    // CLOGRACODI: código do logradouro; um logradouro tem vários trechos.
    streetCode: integer("street_code").notNull(),
    // NLOGRACONC sem acento, em maiúsculas: é a chave que casa com samu_call.street.
    nameKey: text("name_key").notNull(),
    // Nome oficial como a Prefeitura escreve (com acento, em caixa mista).
    officialName: text("official_name"),
    // INDPAV: "Via Pavimentada", "Via Não Pavimentada"...
    paved: text("paved"),
    // Comprimento do trecho, em metros (DB2GSE.Sde).
    lengthM: doublePrecision("length_m").notNull(),
    geom: multiLine("geom").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("street_segment_name_idx").on(t.nameKey), index("street_segment_geom_idx").using("gist", t.geom)],
);
