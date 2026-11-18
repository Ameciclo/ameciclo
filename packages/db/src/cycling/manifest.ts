// What the collector (apps/collector) gathers from Overpass before it writes
// anything: where each piece of the OpenStreetMap snapshot is (in R2, when
// configured), and enough to tell whether it is all there and recent.

export type Part = {
  /** Object key in R2. */
  key: string;
  /** The OSM data date Overpass reported for this piece. */
  timestamp: string | null;
  endpoint: string;
  relations: number;
  ways: number;
};

export type Manifest = {
  version: 1;
  prefix: string;
  collectedAt: string;
  /** How many ways the PDC relations list as members. */
  pdcWayIds: number;
  relations: Part;
  pdcWays: Part[];
  infrastructure: Part[];
};

// Fewer PDC ways fetched than this share of the ones the relations list means a partial answer.
const MIN_PDC_WAYS_SHARE = 0.9;
const DAY = 86_400_000;

/** Problems that make a snapshot unfit to apply; empty when it is good. */
export function manifestProblems(manifest: Manifest, now = Date.now(), maxAgeMs = 3 * DAY): string[] {
  const problems: string[] = [];
  if (manifest.relations.relations === 0) problems.push("nenhuma relação do PDC");

  const gotPdcWays = manifest.pdcWays.reduce((sum, p) => sum + p.ways, 0);
  if (gotPdcWays < manifest.pdcWayIds * MIN_PDC_WAYS_SHARE) {
    problems.push(`só ${gotPdcWays} dos ${manifest.pdcWayIds} trechos do PDC`);
  }
  if (manifest.infrastructure.length === 0 || manifest.infrastructure.every((p) => p.ways === 0)) {
    problems.push("nenhum trecho de infraestrutura");
  }

  for (const part of [manifest.relations, ...manifest.pdcWays, ...manifest.infrastructure]) {
    if (!part.timestamp || !(now - Date.parse(part.timestamp) <= maxAgeMs)) {
      problems.push(`${part.key}: dado do OSM de ${part.timestamp ?? "data desconhecida"}, velho demais`);
    }
  }
  return problems;
}

export function manifestParts(manifest: Manifest): Part[] {
  return [manifest.relations, ...manifest.pdcWays, ...manifest.infrastructure];
}
