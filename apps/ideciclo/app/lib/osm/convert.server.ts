import { booleanIntersects, buffer, length as lineLength, lineString, point, pointToLineDistance } from "@turf/turf";
import type { Classification, OverpassElement, OverpassResponse, SegmentGeometry, SegmentType } from "./types";

const STRUCTURAL = ["motorway", "motorway_link", "trunk", "trunk_link", "primary", "primary_link"];
const FEEDER = ["secondary", "secondary_link", "tertiary", "tertiary_link"];
const LOCAL = ["residential", "unclassified", "living_street", "service"];

// Highest to lowest: the road that decides the hierarchy of a cycleway beside several.
const HIGHWAY_PRIORITY = [...STRUCTURAL, ...FEEDER, "residential", "unclassified"];

export type CityRoadStats = { structuralKm: number; feederKm: number; localKm: number };

/** km of structural, feeder and local roads, from the Overpass highway stats. */
export function calculateCityStats(data: OverpassResponse): CityRoadStats {
  const stats = { structuralKm: 0, feederKm: 0, localKm: 0 };
  for (const element of data.elements) {
    const highway = element.tags.highway;
    if (element.type !== "stat" || !highway) continue;
    const km = Number.parseFloat(element.tags.length ?? "0") / 1000;
    if (STRUCTURAL.includes(highway)) stats.structuralKm += km;
    else if (FEEDER.includes(highway)) stats.feederKm += km;
    else if (["residential", "unclassified"].includes(highway)) stats.localKm += km;
  }
  return {
    structuralKm: Number(stats.structuralKm.toFixed(2)),
    feederKm: Number(stats.feederKm.toFixed(2)),
    localKm: Number(stats.localKm.toFixed(2)),
  };
}

const hasCycleway = (tags: Record<string, string>, values: string[]) =>
  [tags.cycleway, tags["cycleway:left"], tags["cycleway:right"], tags["cycleway:both"]].some((v) => v !== undefined && values.includes(v));

export function determineSegmentType(tags: Record<string, string>): SegmentType | undefined {
  if (hasCycleway(tags, ["lane", "opposite_lane", "buffered_lane"])) return "Ciclofaixa";
  if (tags.highway === "cycleway" || hasCycleway(tags, ["track", "opposite_track"])) return "Ciclovia";
  if (hasCycleway(tags, ["shared_lane", "share_busway", "opposite_share_busway"])) return "Ciclorrota";
  if ((tags.highway === "footway" || tags.highway === "pedestrian") && (tags.bicycle === "designated" || tags.bicycle === "yes")) {
    return "Compartilhada";
  }
  return undefined;
}

/** Hierarquia da via, from the highway tag; undefined for cycleways and anything else. */
export function determineSegmentClassification(tags: Record<string, string>): Classification | undefined {
  const highway = tags.highway;
  if (!highway) return undefined;
  if (STRUCTURAL.includes(highway)) return "estrutural";
  if (FEEDER.includes(highway)) return "alimentadora";
  if (LOCAL.includes(highway)) return "local";
  return undefined;
}

const coordinatesOf = (element: OverpassElement) => (element.geometry ?? []).map((p) => [p.lon, p.lat]);

const priorityOf = (road: OverpassElement) => {
  const index = HIGHWAY_PRIORITY.indexOf(road.tags.highway ?? "");
  return index === -1 ? Number.POSITIVE_INFINITY : index;
};

function distanceToRoad(cycleStart: number[], road: OverpassElement): number {
  try {
    return pointToLineDistance(point(cycleStart), lineString(coordinatesOf(road)), { units: "kilometers" });
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** The road a cycleway runs beside: by name first, then by being within maxDistance km. */
export function findNearbyRoad(cycleway: OverpassElement, roads: OverpassElement[], maxDistance = 0.05): OverpassElement | null {
  if (!cycleway.geometry || cycleway.geometry.length < 2) return null;

  const name = cycleway.tags.name;
  if (name) {
    const matches = roads.filter((road) => {
      const roadName = road.tags.name;
      if (roadName && (roadName === name || name.includes(roadName) || roadName.includes(name))) return true;
      return Boolean(road.tags.ref && name.includes(road.tags.ref));
    });
    const best = [...matches].sort((a, b) => priorityOf(a) - priorityOf(b))[0];
    if (best) return best;
  }

  const coordinates = coordinatesOf(cycleway);
  const zone = buffer(lineString(coordinates), maxDistance, { units: "kilometers" });
  if (!zone) return null;

  const nearby = roads.filter((road) => {
    if (!road.geometry || road.geometry.length < 2) return false;
    try {
      return booleanIntersects(lineString(coordinatesOf(road)), zone);
    } catch {
      return false;
    }
  });
  const classifiable = nearby.filter((road) => HIGHWAY_PRIORITY.includes(road.tags.highway ?? ""));
  if (classifiable.length === 0) return nearby[0] ?? null;

  const start = coordinates[0];
  if (!start) return null;
  const closestOf = (candidates: OverpassElement[]) =>
    candidates
      .map((road) => ({ road, distance: distanceToRoad(start, road) }))
      .reduce<{ road: OverpassElement; distance: number } | null>((best, item) => (!best || item.distance < best.distance ? item : best), null);

  // The highest-priority road type that has one within reach wins; otherwise the closest of any.
  for (const highway of HIGHWAY_PRIORITY) {
    const closest = closestOf(classifiable.filter((road) => road.tags.highway === highway));
    if (closest && closest.distance <= maxDistance) return closest.road;
  }
  return closestOf(classifiable)?.road ?? null;
}

const isCycleStructure = (e: OverpassElement) =>
  e.type === "way" &&
  Boolean(e.geometry) &&
  (e.tags.highway === "cycleway" ||
    Boolean(e.tags.cycleway || e.tags["cycleway:left"] || e.tags["cycleway:right"] || e.tags["cycleway:both"]) ||
    ((e.tags.highway === "footway" || e.tags.highway === "pedestrian") && Boolean(e.tags.bicycle)));

export type NewSegment = {
  id: string;
  name: string;
  type: SegmentType;
  classification: Classification | null;
  length: number;
  geometry: SegmentGeometry;
};

/** Segment ids are the OSM way id behind the city's code, so a way in two cities stays two rows. */
export const segmentId = (cityId: string, osmId: number | string) => `${cityId}_${osmId}`;

export function convertToSegments(data: OverpassResponse, cityId: string): NewSegment[] {
  const structures = data.elements.filter(isCycleStructure);
  const roads = data.elements.filter((e) => e.type === "way" && e.geometry && e.tags.highway && !isCycleStructure(e));

  const segments = new Map<string, NewSegment>();
  for (const element of structures) {
    const id = segmentId(cityId, element.id);
    const coordinates = coordinatesOf(element);
    if (segments.has(id) || coordinates.length < 2) continue;

    const type = determineSegmentType(element.tags);
    if (!type) continue;

    let classification = determineSegmentClassification(element.tags);
    if (element.tags.highway === "cycleway") {
      const road = findNearbyRoad(element, roads);
      classification = (road && determineSegmentClassification(road.tags)) || classification;
    }

    segments.set(id, {
      id,
      name: element.tags.name || element.tags.alt_name || `Segmento ${element.id}`,
      type,
      classification: classification ?? null,
      length: Number(lineLength(lineString(coordinates), { units: "kilometers" }).toFixed(4)),
      geometry: { type: "MultiLineString", coordinates: [coordinates] },
    });
  }
  return [...segments.values()];
}
