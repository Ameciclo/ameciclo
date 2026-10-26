import { dfRegionName } from "./ibge";
import { type OverpassResponse, overpassResponseSchema } from "./types";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, init: RequestInit, retries: number, delay: number): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, init);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      await sleep(delay);
      delay *= 2;
    }
  }
  throw lastError;
}

async function postOverpass(query: string, retries = 3, delay = 2000): Promise<unknown> {
  let lastError: unknown;
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetchWithRetry(
        endpoint,
        { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: query },
        retries,
        delay,
      );
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function queryOverpass(query: string, retries?: number, delay?: number): Promise<OverpassResponse> {
  return overpassResponseSchema.parse(await postOverpass(query, retries, delay));
}

const DF_CITY_ID = "5300108";
const DF_OSM_RELATION_AREA = 3603406826;

async function firstAreaId(query: string): Promise<number | undefined> {
  const data = await queryOverpass(query);
  return data.elements[0]?.id;
}

/** The Overpass area of a municipality (by its IBGE code) or of a DF region (by name). */
export async function getAreaId(cityId: string): Promise<number> {
  const region = dfRegionName(cityId);
  if (region) {
    const id = await firstAreaId(`
      [out:json][timeout:900];
      area["name"="${region}"]["admin_level"="9"]["is_in:state"="Distrito Federal"];
      out ids;
    `);
    if (!id) throw new Error(`A região ${region} não foi encontrada no OpenStreetMap.`);
    return id;
  }

  if (cityId === DF_CITY_ID) {
    const queries = [
      `[out:json][timeout:900]; area["name"="Distrito Federal"]["admin_level"="4"]["ISO3166-2"="BR-DF"]; out ids;`,
      `[out:json][timeout:900]; area(3406826); out ids;`,
      `[out:json][timeout:900]; area["name"="Distrito Federal"]["admin_level"="4"]; out ids;`,
    ];
    for (const query of queries) {
      try {
        const id = await firstAreaId(query);
        if (id) return id;
      } catch {
        // try the next way of finding it
      }
    }
    return DF_OSM_RELATION_AREA;
  }

  const id = await firstAreaId(`
    [out:json][timeout:900];
    area["IBGE:GEOCODIGO"=${cityId}];
    out ids;
  `);
  if (!id) throw new Error(`Área não encontrada no OpenStreetMap para o código ${cityId}.`);
  return id;
}

const failure = (what: string, cityId: string) =>
  `Falha ao obter ${what} da cidade ${cityId}. O serviço Overpass pode estar indisponível ou lento; tente novamente mais tarde.`;

/** Length and count of the roads of each highway type: the "vias" cards of the city. */
export async function fetchHighwayStats(cityId: string): Promise<OverpassResponse> {
  try {
    const areaId = await getAreaId(cityId);
    return await queryOverpass(`
      [out:json][timeout:1200];
      area(${areaId})->.searchArea;
      way ["highway"]
      ["highway"!~"^(construction|cycleway|footway|path|proposed|service|track|bus_stop|corridor|living_street|pedestrian|raceway|steps)$"]
      ["highway"](area.searchArea);
      for (t["highway"])
      {
        make stat highway=_.val,
        count=count(ways),
        length=sum(length());
        out
        body;
      }
    `);
  } catch (error) {
    throw new Error(failure("as estatísticas viárias", cityId), { cause: error });
  }
}

function boundingBox(elements: OverpassResponse["elements"]) {
  const points = elements.flatMap((element) => element.geometry ?? []);
  if (points.length === 0) return null;
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const buffer = 0.001 + 0.005;
  return {
    minLat: Math.min(...lats) - buffer,
    minLon: Math.min(...lons) - buffer,
    maxLat: Math.max(...lats) + buffer,
    maxLon: Math.max(...lons) + buffer,
  };
}

const roadsInBox = (box: { minLat: number; minLon: number; maxLat: number; maxLon: number }) => {
  const bbox = `(${box.minLat},${box.minLon},${box.maxLat},${box.maxLon})`;
  return `
    way["highway"~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link)$"]${bbox};
    way["highway"~"^(secondary|secondary_link|tertiary|tertiary_link)$"]${bbox};
    way["highway"~"^(residential|unclassified|living_street|service)$"]${bbox};
  `;
};

/**
 * Every way with cycle infrastructure in the city, plus the roads around the
 * dedicated cycleways, which the hierarchy of a cycleway is read from.
 */
export async function fetchCityWays(cityId: string): Promise<OverpassResponse> {
  try {
    const areaId = await getAreaId(cityId);
    const cycle = await queryOverpass(
      `
      [out:json][timeout:180];
      area(${areaId})->.searchArea;
      (
        way["cycleway"](area.searchArea);
        way["cycleway:left"](area.searchArea);
        way["cycleway:right"](area.searchArea);
        way["cycleway:both"](area.searchArea);
        way["highway"="cycleway"](area.searchArea);
        way["highway"="footway"]["bicycle"](area.searchArea);
        way["highway"="pedestrian"]["bicycle"](area.searchArea);
      );
      out geom;
    `,
      3,
      2000,
    );

    const cycleways = cycle.elements.filter((e) => e.type === "way" && e.tags.highway === "cycleway" && e.geometry);
    const box = boundingBox(cycleways);
    if (!box) return cycle;

    try {
      const roads = await queryOverpass(`[out:json][timeout:180]; ( ${roadsInBox(box)} ); out geom;`, 3, 2000);
      return { elements: [...cycle.elements, ...roads.elements] };
    } catch {
      // Without the roads, cycleways just stay unclassified.
      return cycle;
    }
  } catch (error) {
    throw new Error(failure("os dados cicloviários", cityId), { cause: error });
  }
}

/** The given ways with their geometry, and the roads around them. */
export async function fetchWaysAndRoadsById(osmIds: string[]) {
  const ids = [...new Set(osmIds.filter((id) => /^\d+$/.test(id)))];
  if (ids.length === 0) return { ways: [], roads: [] };

  const waysData = await queryOverpass(`[out:json][timeout:90]; way(id:${ids.join(",")}); out geom;`, 2, 1500);
  const ways = waysData.elements.filter((e) => e.type === "way" && e.geometry && e.geometry.length >= 2);

  const box = boundingBox(ways);
  if (!box) return { ways, roads: [] };
  const roadsData = await queryOverpass(`[out:json][timeout:90]; ( ${roadsInBox(box)} ); out geom;`, 2, 1500);
  const roads = roadsData.elements.filter((e) => e.type === "way" && e.tags.highway && e.geometry && e.geometry.length >= 2);
  return { ways, roads };
}

export async function fetchIbge(path: string): Promise<unknown> {
  const response = await fetchWithRetry(`https://servicodados.ibge.gov.br/api/v1/localidades/${path}`, {}, 3, 1000);
  return response.json();
}
