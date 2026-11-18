// Um trecho de logradouro do arquivo da Prefeitura (GeoJSON "Trechos de Logradouros") vira uma linha de street_segment.

export type SegmentDraft = {
  sourceId: number;
  streetCode: number;
  nameKey: string;
  officialName: string | null;
  paved: string | null;
  lengthM: number;
  // GeoJSON (MultiLineString) como texto, para ST_GeomFromGeoJSON.
  geometry: string;
};

export type SegmentFeature = {
  properties?: Record<string, unknown> | null;
  geometry?: { type?: string; coordinates?: unknown } | null;
};

// Mesma regra de nome do SAMU (normalizeName em ../samu/transform): sem acento, maiúsculas, sem espaços nas pontas.
export const nameKey = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase().trim().replace(/\s+/g, " ");

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.trunc(v) : null);

export function toSegment(feature: SegmentFeature): { draft: SegmentDraft } | { skipped: string } {
  const p = feature.properties ?? {};
  const sourceId = int(p.OBJECTID);
  const streetCode = int(p.CLOGRACODI);
  const name = text(p.NLOGRACONC);
  const length = p["DB2GSE.Sde"];
  if (sourceId === null || streetCode === null || !name) return { skipped: "sem OBJECTID, código ou nome do logradouro" };
  if (typeof length !== "number" || !Number.isFinite(length) || length < 0) return { skipped: "sem comprimento" };
  const g = feature.geometry;
  if (!g || g.type !== "MultiLineString" || !Array.isArray(g.coordinates) || g.coordinates.length === 0) {
    return { skipped: "geometria que não é MultiLineString" };
  }
  return {
    draft: {
      sourceId,
      streetCode,
      nameKey: nameKey(name),
      officialName: text(p.NLGPAVOFIC),
      paved: text(p.INDPAV),
      lengthM: length,
      geometry: JSON.stringify({ type: "MultiLineString", coordinates: g.coordinates }),
    },
  };
}
