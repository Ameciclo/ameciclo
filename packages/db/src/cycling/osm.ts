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

// Limits declared in each query. Overpass only admits a query that needs at most
// half of what the server has left, so declaring what the query really needs
// (not the 180 s / 512 MiB default, nor more) makes it easier to get in when the
// server is busy. Measured: the PDC relations take ~40 s, the rest is quicker.
const RELATIONS_TIMEOUT_S = 90;
const IDS_TIMEOUT_S = 60;
const TILE_TIMEOUT_S = 120;
const MAX_SIZE = 134_217_728; // 128 MiB

// Bounding box of the RMR (south, west, north, east). Ways outside the 14
// municipalities are dropped when the city is assigned.
export type Bbox = readonly [south: number, west: number, north: number, east: number];
export const RMR_BBOX: Bbox = [-8.55, -35.25, -7.65, -34.8];
const SIDES = ["cycleway", "cycleway:left", "cycleway:right", "cycleway:both"] as const;
const INFRA_VALUES = ["track", "lane", "opposite_lane", "shared_lane", "share_busway"] as const;

// Every way with cycling infrastructure inside a box, in or out of the PDC.
//
// One exact tag match per statement, never a regex: exact values use Overpass's
// index, a regex has to look at every way in the box (the ciclomapa project,
// which queries whole countries, does the same).
export function infrastructureQuery(bbox: Bbox = RMR_BBOX): string {
  const statements = [
    '  way["highway"="cycleway"];',
    ...SIDES.flatMap((side) => INFRA_VALUES.map((value) => `  way["${side}"="${value}"];`)),
    ...(["footway", "pedestrian"] as const).flatMap((highway) =>
      (["yes", "designated"] as const).map((bicycle) => `  way["highway"="${highway}"]["bicycle"="${bicycle}"];`),
    ),
  ];
  return `[out:json][timeout:${TILE_TIMEOUT_S}][maxsize:${MAX_SIZE}][bbox:${bbox.join(",")}];
(
${statements.join("\n")}
);
out tags geom;`;
}

export const INFRASTRUCTURE_QUERY = infrastructureQuery();

/**
 * The RMR box cut in a grid, so each Overpass answer is small enough to arrive
 * and a failure only repeats one piece. A way across a border shows up in both
 * pieces; mergeOsm keeps it once.
 */
export function infrastructureTiles(rows = 3, columns = 2, bbox: Bbox = RMR_BBOX): Bbox[] {
  const [south, west, north, east] = bbox;
  const tiles: Bbox[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      tiles.push([
        round(south + ((north - south) * row) / rows),
        round(west + ((east - west) * column) / columns),
        round(south + ((north - south) * (row + 1)) / rows),
        round(west + ((east - west) * (column + 1)) / columns),
      ]);
    }
  }
  return tiles;
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;

// Just the PDC relations and their member ids: small, no geometry.
export const PDC_RELATIONS_QUERY = `[out:json][timeout:${RELATIONS_TIMEOUT_S}][maxsize:${MAX_SIZE}];
rel["source"="PDC/RMR"]["route"="bicycle"];
out body;`;

/** The geometry of some ways by id; the PDC ones, whether or not anything was built there. */
export function waysByIdQuery(ids: readonly number[]): string {
  return `[out:json][timeout:${IDS_TIMEOUT_S}][maxsize:${MAX_SIZE}];
way(id:${ids.join(",")});
out tags geom;`;
}

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

// Public instances, tried in order. overpass-api.de goes last: it is the most
// overloaded one and has the strictest usage policy (the order the ciclomapa
// project settled on). Only instances that have answered are kept: from the
// Coolify VPS, overpass.private.coffee and overpass.kumi.systems timed out on
// every single attempt (about 15 of 15 each, and private.coffee also served
// data from June and July), and each timeout cost 45 s of every failed attempt.
// The freshness check still refuses an instance that answers with old data.
export const OVERPASS_PRIMARY = "https://overpass-api.de/api/interpreter";
export const OVERPASS_ENDPOINTS = ["https://maps.mail.ru/osm/tools/overpass/api/interpreter", OVERPASS_PRIMARY];

// The mirrors either answer quickly or not at all (measured: every miss was a
// timeout), so waiting the full time for them only delays the instance that works.
const MIRROR_TIMEOUT_MS = 45_000;

export type FetchOptions = {
  endpoints?: readonly string[];
  attemptsPerEndpoint?: number;
  timeoutMs?: number;
  /** Answers whose OSM data is older than this are refused; the next instance is tried. */
  maxAgeMs?: number;
  /** A way to reach whoever runs the sync (an e-mail), sent as the From header: Overpass's etiquette. */
  contact?: string;
  now?: () => number;
  log?: (message: string) => void;
};

// Overpass asks automated clients to say who they are and how to reach them.
const USER_AGENT = "ameciclo-cycling-sync/1.0 (+https://ameciclo.org; weekly sync of the PDC/RMR cycling network)";

const DAY = 86_400_000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Throws when the OSM data behind an answer is older than maxAgeMs. */
export function assertFresh(data: OsmData, maxAgeMs: number, now = Date.now()): void {
  if (!data.timestamp) throw new Error("Overpass não informou a data do OSM");
  const age = now - Date.parse(data.timestamp);
  if (!(age <= maxAgeMs)) {
    throw new Error(`dado do OSM de ${data.timestamp}, velho demais (limite ${Math.round(maxAgeMs / DAY)} dias)`);
  }
}

export async function fetchOverpass(query: string, options: FetchOptions = {}): Promise<OsmData & { endpoint: string }> {
  const {
    endpoints = OVERPASS_ENDPOINTS,
    attemptsPerEndpoint = 2,
    timeoutMs = 120_000,
    maxAgeMs = 3 * DAY,
    contact,
    now = Date.now,
    log = () => {},
  } = options;
  const errors: string[] = [];
  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= attemptsPerEndpoint; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
            ...(contact ? { From: contact } : {}),
          },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(endpoint === OVERPASS_PRIMARY ? timeoutMs : Math.min(timeoutMs, MIRROR_TIMEOUT_MS)),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = parseOverpass(await response.json());
        assertFresh(data, maxAgeMs, now());
        log(`${endpoint}: OSM de ${data.timestamp}`);
        return { ...data, endpoint };
      } catch (error) {
        const message = `${endpoint} (tentativa ${attempt}): ${error instanceof Error ? error.message : String(error)}`;
        errors.push(message);
        log(message);
        // Stale data will not get fresher by asking again: go to the next instance.
        if (error instanceof Error && error.message.includes("velho demais")) break;
        if (attempt < attemptsPerEndpoint) await sleep(attempt * 5_000);
      }
    }
  }
  throw new Error(`Overpass não respondeu:\n${errors.join("\n")}`);
}

/** Pieces of the same snapshot as one: each way once, the oldest timestamp. */
export function mergeOsm(parts: readonly OsmData[]): OsmData {
  const relations = new Map<number, OsmRelation>();
  const ways = new Map<number, OsmWay>();
  for (const part of parts) {
    for (const relation of part.relations) relations.set(relation.osmId, relation);
    for (const way of part.ways) ways.set(way.osmId, way);
  }
  const timestamp = parts.map((p) => p.timestamp).filter((t) => t !== null).sort().at(0) ?? null;
  return { timestamp, relations: [...relations.values()], ways: [...ways.values()] };
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
