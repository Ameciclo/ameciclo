import type { OsmPlace } from "./osm";

const text = (v: string | undefined) => (v && v.trim() ? v.trim() : null);
// "20" vira 20; "10;5" ou "muitas" ficam sem número (a etiqueta continua em `tags`).
const count = (v: string | undefined) => (v && /^\d{1,5}$/.test(v.trim()) ? Number(v.trim()) : null);

export type RackDraft = {
  osmId: string;
  name: string | null;
  capacity: number | null;
  covered: string | null;
  access: string | null;
  operator: string | null;
  parkingType: string | null;
  lon: number;
  lat: number;
  tags: Record<string, string>;
};

export function toRack(p: OsmPlace): RackDraft {
  const t = p.tags;
  return {
    osmId: p.osmId,
    name: text(t.name),
    capacity: count(t.capacity),
    covered: text(t.covered),
    access: text(t.access),
    operator: text(t.operator),
    parkingType: text(t.bicycle_parking),
    lon: p.lon,
    lat: p.lat,
    tags: t,
  };
}

export type StationDraft = {
  osmId: string;
  name: string | null;
  ref: string | null;
  capacity: number | null;
  network: string | null;
  operator: string | null;
  lon: number;
  lat: number;
  tags: Record<string, string>;
};

export function toStation(p: OsmPlace): StationDraft {
  const t = p.tags;
  return { osmId: p.osmId, name: text(t.name), ref: text(t.ref), capacity: count(t.capacity), network: text(t.network), operator: text(t.operator), lon: p.lon, lat: p.lat, tags: t };
}
