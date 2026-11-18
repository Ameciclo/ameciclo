import { OVERPASS_ENDPOINTS, RMR_BBOX } from "../cycling/osm";

// Pontos do OpenStreetMap na Região Metropolitana do Recife: bicicletários e estações de bicicleta compartilhada.
// `out center` dá um ponto também para os que estão mapeados como área (um bicicletário dentro de um prédio).

const bbox = RMR_BBOX.join(",");

export const RACKS_QUERY = `[out:json][timeout:120][bbox:${bbox}];
(
  node["amenity"="bicycle_parking"];
  way["amenity"="bicycle_parking"];
);
out center tags;`;

// A rede Bike PE (operada pela Tembici): estações etiquetadas como aluguel de bicicleta.
export const STATIONS_QUERY = `[out:json][timeout:120][bbox:${bbox}];
(
  node["amenity"="bicycle_rental"]["network"~"Bike ?PE",i];
  node["amenity"="bicycle_rental"]["operator"~"Tembici",i];
);
out center tags;`;

export type OsmPlace = { osmId: string; lat: number; lon: number; tags: Record<string, string> };
export type OsmPlaces = { places: OsmPlace[]; timestamp: string | null };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

// A resposta do Overpass com `out center`: nó tem lat/lon; via e relação trazem `center`.
export function parsePlaces(json: unknown): OsmPlaces {
  if (!isObject(json) || !Array.isArray(json.elements)) throw new Error("Resposta do Overpass sem `elements`");
  const places: OsmPlace[] = [];
  for (const el of json.elements) {
    if (!isObject(el) || typeof el.type !== "string" || !finite(el.id)) continue;
    const center = isObject(el.center) ? el.center : el;
    const { lat, lon } = center;
    if (!finite(lat) || !finite(lon)) continue;
    const tags: Record<string, string> = {};
    if (isObject(el.tags)) for (const [k, v] of Object.entries(el.tags)) if (typeof v === "string") tags[k] = v;
    places.push({ osmId: `${el.type}/${el.id}`, lat, lon, tags });
  }
  const timestamp = isObject(json.osm3s) && typeof json.osm3s.timestamp_osm_base === "string" ? json.osm3s.timestamp_osm_base : null;
  return { places, timestamp };
}

export type FetchPlacesOptions = { timeoutMs?: number; contact?: string; log?: (message: string) => void; rounds?: number; pauseMs?: number };

// Tenta as instâncias do Overpass em até `rounds` rodadas e desiste com o que cada uma respondeu.
export async function fetchPlaces(query: string, options: FetchPlacesOptions = {}): Promise<OsmPlaces & { endpoint: string }> {
  const { timeoutMs = 130_000, contact, log = () => {}, rounds = 4, pauseMs = 20_000 } = options;
  const errors: string[] = [];
  // O Overpass público recusa boa parte das tentativas (502/504): várias rodadas pelos dois servidores, com pausa entre elas.
  for (let round = 1; round <= rounds; round++) {
  if (round > 1) await new Promise((resolve) => setTimeout(resolve, pauseMs * (round - 1)));
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "User-Agent": "ameciclo-observatorio/1.0 (https://ameciclo.org)", "Content-Type": "application/x-www-form-urlencoded", ...(contact ? { From: contact } : {}) },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = parsePlaces(await response.json());
      log(`${endpoint}: ${data.places.length} pontos (OSM de ${data.timestamp})`);
      return { ...data, endpoint };
    } catch (error) {
      const message = `${endpoint}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(message);
      log(message);
    }
  }
  }
  throw new Error(`Overpass não respondeu:\n${errors.join("\n")}`);
}
