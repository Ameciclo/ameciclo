import { describe, expect, it } from "vitest";

import {
  assertFresh,
  builtTypology,
  INFRASTRUCTURE_QUERY,
  infrastructureQuery,
  infrastructureTiles,
  mergeOsm,
  parseOverpass,
  PDC_RELATIONS_QUERY,
  RMR_BBOX,
  relationRef,
  wayGeometry,
  waysByIdQuery,
} from "./osm";

describe("builtTypology", () => {
  it("reads the cycleway tags of the street", () => {
    expect(builtTypology({ highway: "primary", "cycleway:right": "track" }, false)).toBe("ciclovia");
    expect(builtTypology({ highway: "secondary", "cycleway:left": "lane" }, false)).toBe("ciclofaixa");
    expect(builtTypology({ highway: "tertiary", cycleway: "opposite_lane" }, false)).toBe("ciclofaixa");
    expect(builtTypology({ highway: "residential", cycleway: "shared_lane" }, false)).toBe("ciclorrota");
    expect(builtTypology({ highway: "residential", cycleway: "share_busway" }, false)).toBe("ciclorrota");
  });

  it("takes the first side that says something", () => {
    expect(builtTypology({ highway: "residential", "cycleway:left": "shared_lane", "cycleway:right": "lane" }, false)).toBe("ciclorrota");
    expect(builtTypology({ highway: "secondary", "cycleway:left": "lane", "cycleway:right": "shared_lane" }, false)).toBe("ciclofaixa");
  });

  it("calls a separate path a ciclovia", () => {
    expect(builtTypology({ highway: "cycleway" }, false)).toBe("ciclovia");
    // A crossing is a ciclovia too, but a lane tagged on a cycleway wins.
    expect(builtTypology({ highway: "cycleway", cycleway: "crossing" }, false)).toBe("ciclovia");
    expect(builtTypology({ highway: "cycleway", cycleway: "lane" }, false)).toBe("ciclofaixa");
  });

  it("calls a footway a calçada compartilhada when bikes are allowed or the PDC designates it", () => {
    expect(builtTypology({ highway: "footway", bicycle: "designated" }, false)).toBe("calcada_compartilhada");
    expect(builtTypology({ highway: "pedestrian", bicycle: "yes" }, false)).toBe("calcada_compartilhada");
    expect(builtTypology({ highway: "footway" }, false)).toBeNull();
    expect(builtTypology({ highway: "footway" }, true)).toBe("calcada_compartilhada");
  });

  it("finds nothing on an ordinary street", () => {
    expect(builtTypology({ highway: "primary" }, true)).toBeNull();
    expect(builtTypology({ highway: "trunk", bicycle: "yes" }, false)).toBeNull();
  });
});

describe("parseOverpass", () => {
  const response = {
    osm3s: { timestamp_osm_base: "2026-11-16T23:45:06Z" },
    elements: [
      { type: "relation", id: 7, tags: { ref: "CM01" }, members: [{ type: "way", ref: 10, role: "" }, { type: "node", ref: 1, role: "" }] },
      { type: "way", id: 10, tags: { highway: "cycleway" }, geometry: [{ lat: -8, lon: -35 }, { lat: -8.1, lon: -35.1 }] },
    ],
  };

  it("splits relations and ways, with GeoJSON order (lon, lat)", () => {
    const data = parseOverpass(response);
    expect(data.timestamp).toBe("2026-11-16T23:45:06Z");
    expect(data.relations).toEqual([{ osmId: 7, tags: { ref: "CM01" }, wayIds: [10] }]);
    expect(data.ways).toEqual([{ osmId: 10, tags: { highway: "cycleway" }, coordinates: [[-35, -8], [-35.1, -8.1]] }]);
  });

  it("refuses an answer with a remark: it ran out of time or memory", () => {
    expect(() => parseOverpass({ ...response, remark: "runtime error: Query timed out" })).toThrow(/timed out/);
  });
});

describe("relationRef", () => {
  it("uses the ref tag, then the code in the description", () => {
    expect(relationRef({ ref: "CM38" })).toBe("CM38");
    expect(relationRef({ description: "CÓD (PDC/RMR): CCV05 | Tipologia prevista: Ciclovia" })).toBe("CCV05");
    expect(relationRef({})).toBeNull();
  });
});

describe("wayGeometry", () => {
  const ring: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 0]];
  it("is a line, unless it is a closed area", () => {
    expect(wayGeometry({ osmId: 1, tags: {}, coordinates: ring }).type).toBe("LineString");
    expect(wayGeometry({ osmId: 1, tags: { area: "yes" }, coordinates: ring }).type).toBe("Polygon");
  });
});

it("asks Overpass for every side tag", () => {
  for (const side of ["cycleway", "cycleway:left", "cycleway:right", "cycleway:both"]) expect(INFRASTRUCTURE_QUERY).toContain(`"${side}"`);
});

describe("tiles", () => {
  it("cover the whole box with no gap", () => {
    const tiles = infrastructureTiles(3, 2);
    expect(tiles).toHaveLength(6);
    expect(Math.min(...tiles.map((t) => t[0]))).toBe(RMR_BBOX[0]);
    expect(Math.min(...tiles.map((t) => t[1]))).toBe(RMR_BBOX[1]);
    expect(Math.max(...tiles.map((t) => t[2]))).toBe(RMR_BBOX[2]);
    expect(Math.max(...tiles.map((t) => t[3]))).toBe(RMR_BBOX[3]);
    // Neighbours share their edge exactly.
    expect(tiles[0]?.[3]).toBe(tiles[1]?.[1]);
    expect(tiles[0]?.[2]).toBe(tiles[2]?.[0]);
  });
});

describe("waysByIdQuery", () => {
  it("asks for the ids given", () => {
    expect(waysByIdQuery([1, 22, 333])).toContain("way(id:1,22,333);");
  });
});

describe("mergeOsm", () => {
  const way = (osmId: number) => ({ osmId, tags: {}, coordinates: [[0, 0], [1, 1]] as [number, number][] });
  it("keeps each way once and the oldest timestamp", () => {
    const merged = mergeOsm([
      { timestamp: "2026-11-16T10:00:00Z", relations: [], ways: [way(1), way(2)] },
      { timestamp: "2026-11-15T10:00:00Z", relations: [{ osmId: 9, tags: {}, wayIds: [1] }], ways: [way(2), way(3)] },
    ]);
    expect(merged.ways.map((w) => w.osmId).sort()).toEqual([1, 2, 3]);
    expect(merged.relations).toHaveLength(1);
    expect(merged.timestamp).toBe("2026-11-15T10:00:00Z");
  });
});

describe("assertFresh", () => {
  const data = { timestamp: "2026-07-28T02:16:18Z", relations: [], ways: [] };
  it("refuses data months old", () => {
    expect(() => assertFresh(data, 3 * 86_400_000, Date.parse("2026-11-17T00:00:00Z"))).toThrow("velho demais");
  });
  it("accepts recent data", () => {
    expect(() => assertFresh(data, 3 * 86_400_000, Date.parse("2026-07-29T00:00:00Z"))).not.toThrow();
  });
  it("refuses an answer without a date", () => {
    expect(() => assertFresh({ ...data, timestamp: null }, 1)).toThrow();
  });
});

describe("infrastructureQuery", () => {
  it("matches exact values, never a regex", () => {
    expect(INFRASTRUCTURE_QUERY).not.toContain("~");
    for (const value of ["track", "lane", "opposite_lane", "shared_lane", "share_busway"]) {
      expect(INFRASTRUCTURE_QUERY).toContain(`way["cycleway:left"="${value}"];`);
    }
    expect(INFRASTRUCTURE_QUERY).toContain('way["highway"="footway"]["bicycle"="designated"];');
    expect(INFRASTRUCTURE_QUERY).toContain('way["highway"="pedestrian"]["bicycle"="yes"];');
  });

  it("asks for every typology that builtTypology reads", () => {
    // Anything builtTypology calls built has to be in the query, or it never arrives.
    for (const side of ["cycleway", "cycleway:left", "cycleway:right", "cycleway:both"]) {
      for (const [value, typology] of [["track", "ciclovia"], ["lane", "ciclofaixa"], ["opposite_lane", "ciclofaixa"], ["shared_lane", "ciclorrota"], ["share_busway", "ciclorrota"]]) {
        expect(builtTypology({ [side]: value }, false)).toBe(typology);
        expect(INFRASTRUCTURE_QUERY).toContain(`way["${side}"="${value}"];`);
      }
    }
  });
});

describe("declared limits", () => {
  it("every query says how much time and memory it needs", () => {
    for (const query of [PDC_RELATIONS_QUERY, waysByIdQuery([1]), infrastructureQuery()]) {
      expect(query).toMatch(/\[timeout:\d+\]/);
      expect(query).toMatch(/\[maxsize:\d+\]/);
    }
  });
});
