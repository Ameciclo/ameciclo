// Cycling infrastructure straight from OpenStreetMap, through the Overpass API:
// the PDC route relations with the ways in them, and every way with cycling
// infrastructure in the Região Metropolitana do Recife.
//
// Pure parsing and rules live here; writing to the database is in sync.ts.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

// The PDC relations (tagged source=PDC/RMR), their members, and the ways in them
// whether or not anything was built there.
export const PDC_QUERY = `[out:json][timeout:180];
rel["source"="PDC/RMR"]["route"="bicycle"]->.pdc;
.pdc out body;
way(r.pdc);
out tags geom;`;

// Bounding box of the RMR (south, west, north, east). Ways outside the 14
// municipalities are dropped when the city is assigned.
const RMR_BBOX = "-8.55,-35.25,-7.65,-34.8";
const SIDES = ["cycleway", "cycleway:left", "cycleway:right", "cycleway:both"] as const;
const INFRA_VALUES = "^(track|lane|opposite_lane|shared_lane|share_busway)$";

// Every way with cycling infrastructure, in or out of the PDC.
export const INFRASTRUCTURE_QUERY = `[out:json][timeout:240][bbox:${RMR_BBOX}];
(
  way["highway"="cycleway"];
${SIDES.map((side) => `  way["${side}"~"${INFRA_VALUES}"];`).join("\n")}
  way["highway"~"^(footway|pedestrian)$"]["bicycle"~"^(yes|designated)$"];
);
out tags geom;`;

// ---------------------------------------------------------------------------
// Overpass response
// ---------------------------------------------------------------------------

const tags = z.record(z.string(), z.string()).default({});

const OverpassWay = z.object({
  type: z.literal("way"),
  id: z.number().int(),
  tags,
  geometry: z.array(z.object({ lat: z.number(), lon: z.number() })).default([]),
});

const OverpassRelation = z.object({
  type: z.literal("relation"),
  id: z.number().int(),
  tags,
  members: z.array(z.object({ type: z.string(), ref: z.number().int() })).default([]),
});

const OverpassResponse = z.object({
  // Overpass answers 200 with a remark when it ran out of time or memory: the
  // elements are then incomplete.
  remark: z.string().optional(),
  osm3s: z.object({ timestamp_osm_base: z.string().optional() }).optional(),
  elements: z.array(z.union([OverpassWay, OverpassRelation, z.object({ type: z.string() })])),
});

export type OsmWay = { osmId: number; tags: Record<string, string>; coordinates: [number, number][] };
export type OsmRelation = { osmId: number; tags: Record<string, string>; wayIds: number[] };
export type OsmData = {
  /** When OpenStreetMap's data was last updated, as Overpass reports it. */
  timestamp: string | null;
  relations: OsmRelation[];
  ways: OsmWay[];
};

export function parseOverpass(json: unknown): OsmData {
  const response = OverpassResponse.parse(json);
  if (response.remark) throw new Error(`Overpass: ${response.remark}`);

  const relations: OsmRelation[] = [];
  const ways: OsmWay[] = [];
  for (const element of response.elements) {
    const way = OverpassWay.safeParse(element);
    if (way.success) {
      ways.push({
        osmId: way.data.id,
        tags: way.data.tags,
        coordinates: way.data.geometry.map((p) => [p.lon, p.lat]),
      });
      continue;
    }
    const relation = OverpassRelation.safeParse(element);
    if (relation.success) {
      relations.push({
        osmId: relation.data.id,
        tags: relation.data.tags,
        wayIds: relation.data.members.filter((m) => m.type === "way").map((m) => m.ref),
      });
    }
  }
  return { timestamp: response.osm3s?.timestamp_osm_base ?? null, relations, ways };
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

// Public instances, tried in order: the main one often answers 429 or 504.
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const ATTEMPTS_PER_ENDPOINT = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchOverpass(query: string, endpoints: string[] = ENDPOINTS): Promise<OsmData> {
  const errors: string[] = [];
  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_ENDPOINT; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "User-Agent": "ameciclo-cycling-sync/1.0", "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(300_000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return parseOverpass(await response.json());
      } catch (error) {
        errors.push(`${endpoint} (tentativa ${attempt}): ${error instanceof Error ? error.message : String(error)}`);
        await sleep(attempt * 10_000);
      }
    }
  }
  throw new Error(`Overpass não respondeu:\n${errors.join("\n")}`);
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const BY_SIDE_VALUE = new Map([
  ["track", "ciclovia"],
  ["lane", "ciclofaixa"],
  ["opposite_lane", "ciclofaixa"],
  ["shared_lane", "ciclorrota"],
  ["share_busway", "ciclorrota"],
]);

/**
 * The typology built on a way, read from its OSM tags; null when there is none.
 *
 * The first of cycleway, cycleway:left, cycleway:right and cycleway:both that
 * says something wins, then highway=cycleway. A footway or pedestrian way is a
 * "calçada compartilhada" when it allows bicycles, or when a PDC relation
 * designates it. These rules give the same answer as the atlas export for all of
 * its 4343 ways.
 */
export function builtTypology(wayTags: Record<string, string>, inPdc: boolean): string | null {
  for (const side of SIDES) {
    const typology = BY_SIDE_VALUE.get(wayTags[side] ?? "");
    if (typology) return typology;
  }
  const highway = wayTags.highway;
  if (highway === "cycleway") return "ciclovia";
  if ((highway === "footway" || highway === "pedestrian") && (inPdc || wayTags.bicycle === "yes" || wayTags.bicycle === "designated")) {
    return "calcada_compartilhada";
  }
  return null;
}

/** GeoJSON for a way: a line, or a polygon when the way closes on itself and is an area. */
export function wayGeometry(way: OsmWay) {
  const closed = way.coordinates.length > 3 && way.coordinates[0]?.join() === way.coordinates.at(-1)?.join();
  return closed && way.tags.area === "yes"
    ? { type: "Polygon", coordinates: [way.coordinates] }
    : { type: "LineString", coordinates: way.coordinates };
}

/** The project reference ("CM01") of a PDC relation. */
export function relationRef(relationTags: Record<string, string>): string | null {
  return relationTags.ref?.trim() || relationTags.description?.match(/CÓD \(PDC\/RMR\):\s*([A-Z0-9]+)/)?.[1] || null;
}
