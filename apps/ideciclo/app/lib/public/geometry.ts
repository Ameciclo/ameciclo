import { z } from "zod";

const Position = z.tuple([z.number(), z.number()]).rest(z.number());

// The segments are lines; a merged trecho is a MultiLineString.
export const LineGeometry = z.discriminatedUnion("type", [
  z.object({ type: z.literal("LineString"), coordinates: z.array(Position) }),
  z.object({ type: z.literal("MultiLineString"), coordinates: z.array(z.array(Position)) }),
]);

export type LineGeometry = z.infer<typeof LineGeometry>;

export function parseGeometry(value: unknown): LineGeometry | null {
  const parsed = LineGeometry.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function linePositions(geometry: LineGeometry | null): [number, number][] {
  if (!geometry) return [];
  const lines = geometry.type === "LineString" ? [geometry.coordinates] : geometry.coordinates;
  return lines.flatMap((line) => line.map((position): [number, number] => [position[0], position[1]]));
}

export type Bounds = [[number, number], [number, number]];

export function boundsOf(positions: [number, number][], minPadding: number): Bounds | null {
  const first = positions[0];
  if (!first) return null;
  let [minLng, minLat] = first;
  let [maxLng, maxLat] = first;
  for (const [lng, lat] of positions) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const lngPadding = Math.max((maxLng - minLng) * 0.12, minPadding);
  const latPadding = Math.max((maxLat - minLat) * 0.12, minPadding);
  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ];
}
