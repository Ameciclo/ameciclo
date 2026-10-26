import type { LineGeometry } from "./segment-technical";

export type Position = number[];

export const lineCoordinates = (geometry: LineGeometry): Position[] =>
  geometry.type === "LineString" ? geometry.coordinates : geometry.coordinates.flat();

/** [[west, south], [east, north]] around the coordinates, padded by a share of its size. */
export const boundsOf = (coordinates: Position[], paddingRatio = 0.12, minPadding = 0.003): [[number, number], [number, number]] | null => {
  const first = coordinates[0];
  if (!first) return null;

  let west = first[0] ?? 0;
  let east = west;
  let south = first[1] ?? 0;
  let north = south;
  for (const [lng = 0, lat = 0] of coordinates) {
    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
  }

  const lngPadding = Math.max((east - west) * paddingRatio, minPadding);
  const latPadding = Math.max((north - south) * paddingRatio, minPadding);
  return [
    [west - lngPadding, south - latPadding],
    [east + lngPadding, north + latPadding],
  ];
};
