import { sql } from "drizzle-orm";

import type { Db } from "./index";

// ---------------------------------------------------------------------------
// Busca de logradouros pelo nome, na malha viária do Recife (street_segment). Alimenta a busca de rua do CicloDados.
// ---------------------------------------------------------------------------

export type StreetHit = {
  // A chave do logradouro (nome sem acento, em maiúsculas), igual à de samu_call.street.
  key: string;
  name: string;
  lengthM: number;
  lat: number;
  lng: number;
  bounds: { north: number; south: number; east: number; west: number };
};

// A Prefeitura abrevia o tipo do logradouro na chave ("AV GOVERNADOR AGAMENON MAGALHAES"): quem digita "avenida" ou "praça"
// precisa casar com "AV" e "PRC".
const ABBREVIATIONS: Record<string, string> = { AVENIDA: "AV", TRAVESSA: "TRV", PRACA: "PRC", PONTE: "PTE", ESTRADA: "EST", ALAMEDA: "ALM", RODOVIA: "ROD" };

export function searchTokens(query: string): string[] {
  const words = query
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  // "r" e "av" soltos não restringem nada: ficam, mas a busca exige ao menos uma palavra de 2+ letras.
  return words.map((w) => ABBREVIATIONS[w] ?? w).slice(0, 6);
}

export async function searchStreets(db: Db, query: string, limit = 8): Promise<StreetHit[]> {
  const tokens = searchTokens(query);
  if (!tokens.some((t) => t.length >= 2)) return [];
  const where = sql.join(tokens.map((t) => sql`name_key like ${"%" + t + "%"}`), sql` and `);
  const rows = (
    await db.execute<{ key: string; name: string | null; length: number; west: number; south: number; east: number; north: number; lat: number; lng: number }>(sql`
      select name_key as key, max(official_name) as name, sum(length_m) as length,
        ST_XMin(ST_Extent(geom)::box3d) as west, ST_YMin(ST_Extent(geom)::box3d) as south,
        ST_XMax(ST_Extent(geom)::box3d) as east, ST_YMax(ST_Extent(geom)::box3d) as north,
        -- um ponto da própria via (o centro da caixa pode cair em outra rua)
        ST_Y(ST_ClosestPoint(ST_Collect(geom), ST_Centroid(ST_Collect(geom)))) as lat,
        ST_X(ST_ClosestPoint(ST_Collect(geom), ST_Centroid(ST_Collect(geom)))) as lng
      from street_segment
      where ${where}
      group by name_key
      order by (name_key like ${tokens[0] + "%"}) desc, sum(length_m) desc
      limit ${limit}`)
  ).rows;
  return rows.map((r) => ({
    key: r.key,
    name: r.name ?? r.key,
    lengthM: Number(r.length),
    lat: r.lat,
    lng: r.lng,
    bounds: { north: r.north, south: r.south, east: r.east, west: r.west },
  }));
}
