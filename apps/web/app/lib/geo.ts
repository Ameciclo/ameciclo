// Um círculo geográfico: o polígono dos pontos a `radiusMeters` do centro. Desenhado como camada do mapa, acompanha o zoom e
// cobre exatamente a área que a consulta usa (um círculo em CSS tinha o tamanho calculado à mão e saía deslocado).
const EARTH_RADIUS_M = 6_371_008.8;

export function circlePolygon(lat: number, lng: number, radiusMeters: number, steps = 64): GeoJSON.Polygon {
  const rad = Math.PI / 180;
  const angular = radiusMeters / EARTH_RADIUS_M;
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    const lat2 = Math.asin(Math.sin(lat * rad) * Math.cos(angular) + Math.cos(lat * rad) * Math.sin(angular) * Math.cos(bearing));
    const lng2 = lng * rad + Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(lat * rad), Math.cos(angular) - Math.sin(lat * rad) * Math.sin(lat2));
    ring.push([lng2 / rad, lat2 / rad]);
  }
  return { type: "Polygon", coordinates: [ring] };
}
