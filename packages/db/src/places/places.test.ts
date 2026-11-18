import { describe, expect, it } from "vitest";

import { parsePlaces } from "./osm";
import { toRack, toStation } from "./transform";

const response = {
  osm3s: { timestamp_osm_base: "2026-11-18T12:00:00Z" },
  elements: [
    { type: "node", id: 1, lat: -8.05, lon: -34.9, tags: { amenity: "bicycle_parking", capacity: "12", covered: "yes", bicycle_parking: "stands", operator: " Prefeitura " } },
    { type: "way", id: 2, center: { lat: -8.06, lon: -34.91 }, tags: { amenity: "bicycle_parking", capacity: "10;5" } },
    { type: "node", id: 3, tags: { amenity: "bicycle_parking" } },
    { type: "node", id: 4, lat: -8.1, lon: -34.95, tags: { amenity: "bicycle_rental", network: "Bike PE", ref: "79", capacity: "16" } },
  ],
};

describe("parsePlaces", () => {
  const { places, timestamp } = parsePlaces(response);

  it("lê nós, e usa o centro das vias; descarta o que não tem posição", () => {
    expect(places.map((p) => p.osmId)).toEqual(["node/1", "way/2", "node/4"]);
    expect(places[1]).toMatchObject({ lat: -8.06, lon: -34.91 });
    expect(timestamp).toBe("2026-11-18T12:00:00Z");
  });

  it("recusa uma resposta sem elementos", () => {
    expect(() => parsePlaces({ nada: true })).toThrow("elements");
  });

  it("bicicletário: capacidade só quando é número, texto sem espaços nas pontas", () => {
    const [a, b] = places.map(toRack);
    expect(a).toMatchObject({ capacity: 12, covered: "yes", parkingType: "stands", operator: "Prefeitura" });
    expect(b.capacity).toBeNull();
    expect(b.tags.capacity).toBe("10;5");
  });

  it("estação: número da estação e capacidade", () => {
    expect(toStation(places[2])).toMatchObject({ ref: "79", capacity: 16, network: "Bike PE", name: null });
  });
});
