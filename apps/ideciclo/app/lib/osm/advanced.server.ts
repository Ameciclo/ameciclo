import { lineIntersect, lineString } from "@turf/turf";
import { determineSegmentClassification, determineSegmentType, findNearbyRoad } from "./convert.server";
import { fetchWaysAndRoadsById } from "./overpass.server";
import type { Confidence, IntersectionPreview, Prefill, Suggestion, Technical } from "./technical";
import type { OverpassElement } from "./types";

// Reads what the IDECICLO form needs (position on the road, speed, lanes,
// direction, pavement, width, separation) from the OpenStreetMap tags of a way,
// and counts the intersections along it. Whatever the tags do not say is listed
// as a pendency, with the tags that would fix it.

const numericTag = (value?: string): number | undefined => {
  if (!value) return undefined;
  const match = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  const parsed = match ? Number(match[0]) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
};

function maxSpeed(value?: string): string | undefined {
  if (!value) return undefined;
  const numeric = numericTag(value);
  if (numeric !== undefined) return String(Math.round(numeric));
  return value.toLowerCase() === "br:urban" ? "60" : value;
}

function positionOnRoad(tags: Record<string, string>): string | undefined {
  if (tags["cycleway:both"]) return "ambos os lados da via";
  if (tags["cycleway:left"] && tags["cycleway:right"]) return "lados esquerdo e direito";
  if (tags["cycleway:left"]) return "lado esquerdo da via";
  if (tags["cycleway:right"]) return "lado direito da via";
  if (tags.highway === "cycleway") return tags.segregated === "yes" ? "infraestrutura segregada" : "infraestrutura dedicada";

  const onSidewalk = ["both", "left", "right"].includes(tags.sidewalk ?? "") || tags.highway === "footway" || tags.highway === "pedestrian";
  if (onSidewalk && (tags.bicycle === "designated" || tags.bicycle === "yes")) {
    return tags.segregated === "yes" ? "calçada partilhada segregada" : "calçada partilhada";
  }
  return undefined;
}

function direction(tags: Record<string, string>): string | undefined {
  if (tags["oneway:bicycle"] === "no" || tags["cycleway:oneway"] === "no") return "contrafluxo provável";
  if (tags.oneway === "yes") return "unidirecional";
  if (tags.oneway === "no" || tags["cycleway:both"] || tags.cycleway === "track") return "bidirecional";
  if (tags["cycleway:left"] || tags["cycleway:right"]) return "unidirecional";
  return undefined;
}

function lanes(tags: Record<string, string>): number | undefined {
  const total = numericTag(tags.lanes);
  if (total !== undefined) return Math.max(1, Math.round(total));
  const forward = numericTag(tags["lanes:forward"]);
  const backward = numericTag(tags["lanes:backward"]);
  if (forward !== undefined && backward !== undefined) return Math.max(1, Math.round(forward + backward));
  if (forward !== undefined && tags.oneway === "yes") return Math.max(1, Math.round(forward));
  return undefined;
}

function pavement(tags: Record<string, string>): string | undefined {
  const surface = tags.surface?.toLowerCase();
  if (!surface) return undefined;
  if (["asphalt", "concrete", "concrete:lanes", "concrete:plates", "paved"].includes(surface)) return "asfalto/concreto (melhor)";
  if (["paving_stones", "sett", "unhewn_cobblestone", "brick"].includes(surface)) return "blocos (razoável)";
  if (["cobblestone", "stone", "pebblestone"].includes(surface)) return "paralelepípedo/pedra (regular)";
  if (["dirt", "earth", "sand", "mud", "metal", "grass", "gravel", "ground"].includes(surface)) return "inadequado/revisar";
  return surface;
}

function separation(tags: Record<string, string>): string | undefined {
  const values = [tags.separation, tags["cycleway:separation"], tags.buffer, tags["cycleway:buffer"], tags.kerb, tags.barrier].filter(
    (value): value is string => Boolean(value),
  );
  return values.length > 0 ? values.join(" | ") : undefined;
}

function hasCyclingInfrastructure(tags: Record<string, string>): boolean | null {
  if (Object.keys(tags).length === 0) return null;
  if (tags.highway === "cycleway") return true;
  if (tags.cycleway || tags["cycleway:left"] || tags["cycleway:right"] || tags["cycleway:both"]) return true;
  const shared = tags.bicycle === "designated" || tags.bicycle === "yes";
  if (shared) return true;
  return false;
}

function intersectionsAlong(segment: OverpassElement, roads: OverpassElement[]) {
  const geometry = segment.geometry;
  if (!geometry || geometry.length < 2) {
    return { previews: [], intersections: 0, blocks: 1, relevant: 0 };
  }
  const line = lineString(geometry.map((p) => [p.lon, p.lat]));
  const points = new Set<string>();
  const relevantPoints = new Set<string>();
  const previews = new Map<string, IntersectionPreview>();

  for (const road of roads) {
    if (road.id === segment.id || !road.geometry || road.geometry.length < 2) continue;
    try {
      const crossings = lineIntersect(line, lineString(road.geometry.map((p) => [p.lon, p.lat])));
      const hierarchy = determineSegmentClassification(road.tags) ?? "não classificada";
      for (const feature of crossings.features) {
        const [lon, lat] = feature.geometry.coordinates;
        if (lon === undefined || lat === undefined) continue;
        const pointKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
        points.add(pointKey);
        if (hierarchy === "estrutural" || hierarchy === "alimentadora") relevantPoints.add(pointKey);
        previews.set(`${pointKey}-${road.id}`, {
          pointKey,
          roadId: String(road.id),
          roadName: road.tags.name || road.tags.ref || `Via ${road.id}`,
          highway: road.tags.highway,
          hierarchy,
          hasCyclingInfrastructure: hasCyclingInfrastructure(road.tags),
        });
      }
    } catch {
      // A road whose geometry cannot be intersected just does not count.
    }
  }
  return { previews: [...previews.values()], intersections: points.size, blocks: Math.max(1, points.size + 1), relevant: relevantPoints.size };
}

type Pending = { field: string; label: string; confidence: Confidence; suggestion: Suggestion };

const missing = (field: string, label: string, reason: string, suggestedTags: string[], priority: Suggestion["priority"], confidence: Confidence): Pending => ({
  field,
  label,
  confidence,
  suggestion: { field, reason, suggestedTags, priority },
});

export type OsmComplement = { osmId: string; technical: Technical };

export function parseOsmWay(way: OverpassElement, roads: OverpassElement[]): OsmComplement {
  const tags = way.tags;
  const type = determineSegmentType(tags);
  let hierarchy = determineSegmentClassification(tags);
  if (tags.highway === "cycleway") {
    const road = findNearbyRoad(way, roads);
    hierarchy = (road && determineSegmentClassification(road.tags)) || hierarchy;
  }

  const position = positionOnRoad(tags);
  const speed = maxSpeed(tags.maxspeed);
  const laneCount = lanes(tags);
  const flow = direction(tags);
  const surface = pavement(tags);
  const width = numericTag(tags["cycleway:width"]) ?? numericTag(tags.width) ?? numericTag(tags.est_width);
  const buffer = separation(tags);

  const confidence: Record<string, Confidence> = {
    posicaoNaVia: position ? "medium" : "low",
    velocidade: speed ? (tags.maxspeed ? "high" : "low") : "unknown",
    numeroFaixas: laneCount === undefined ? "unknown" : "high",
    sentido: flow ? "medium" : "low",
    pavimento: surface ? "medium" : "unknown",
    largura: width === undefined ? "unknown" : "medium",
    bufferSeparacao: buffer ? "low" : "unknown",
  };

  const pendencies: Pending[] = [];
  if (!position) pendencies.push(missing("posicaoNaVia", "Posição na via", "Sem tags suficientes para posição na via.", ["cycleway:left", "cycleway:right", "cycleway:both", "sidewalk", "segregated"], "medium", "low"));
  if (!speed) pendencies.push(missing("velocidade", "Velocidade regulamentada", "Tag de velocidade ausente.", ["maxspeed=*"], "high", "unknown"));
  if (laneCount === undefined) pendencies.push(missing("numeroFaixas", "Número de faixas", "Não foi possível inferir faixas de tráfego.", ["lanes", "lanes:forward", "lanes:backward", "oneway"], "medium", "unknown"));
  if (!flow) pendencies.push(missing("sentido", "Sentido de circulação", "Tags de sentido insuficientes.", ["oneway", "oneway:bicycle", "cycleway:oneway"], "medium", "low"));
  if (!surface) pendencies.push(missing("pavimento", "Pavimento", "Superfície não mapeada.", ["surface", "smoothness"], "medium", "unknown"));
  if (width === undefined) pendencies.push(missing("largura", "Largura", "Largura não disponível no OSM.", ["cycleway:width", "width", "est_width"], "high", "unknown"));
  if (!buffer) pendencies.push(missing("bufferSeparacao", "Buffer/separação", "Separação física não descrita de forma clara.", ["separation", "cycleway:separation", "buffer", "cycleway:buffer", "kerb", "barrier"], "low", "unknown"));

  const crossings = intersectionsAlong(way, roads);
  const prefill: Prefill = {
    nome: tags.name || tags.official_name || tags.alt_name || tags.ref,
    tipologia: type,
    posicaoNaVia: position,
    hierarquia: hierarchy,
    velocidade: speed,
    sentido: flow,
    numeroFaixas: laneCount,
    pavimento: surface,
    largura: width,
    bufferSeparacao: buffer,
    pendenciasCampo: pendencies.map((p) => p.label),
  };

  return {
    osmId: String(way.id),
    technical: {
      osm_id: String(way.id),
      osm_type: way.type,
      osm_tags: tags,
      osm_confidence: confidence,
      ideciclo_prefill: prefill,
      osm_improvement_suggestions: pendencies.map((p) => p.suggestion),
      intersections_preview: crossings.previews,
      estimated_blocks_count: crossings.blocks,
      estimated_intersections_count: crossings.intersections,
      relevant_intersections_count: crossings.relevant,
      connected_intersections_count: 0,
    },
  };
}

/** Fetches the ways from the OpenStreetMap and reads each one. */
export async function fetchOsmComplements(osmIds: string[]): Promise<OsmComplement[]> {
  const { ways, roads } = await fetchWaysAndRoadsById(osmIds);
  return ways.map((way) => parseOsmWay(way, roads));
}
