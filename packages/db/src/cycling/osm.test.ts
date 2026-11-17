import { describe, expect, it } from "vitest";

import { builtTypology, INFRASTRUCTURE_QUERY, parseOverpass, relationRef, wayGeometry } from "./osm";

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
