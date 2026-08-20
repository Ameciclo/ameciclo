import { CICLODADOS_BASE } from '~/servers';

export interface StreetMatch {
  id: string;
  name: string;
  confidence: number;
  municipality: string;
  length?: number;
  coordinates?: { lat: number; lng: number };
  bounds?: { north: number; south: number; east: number; west: number };
}

export interface StreetSearchResponse {
  matches: StreetMatch[];
}

export interface StreetDetails {
  id: string;
  name: string;
  geometry: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: {
        type: 'MultiLineString';
        coordinates: number[][][];
      };
      properties: Record<string, any>;
    }>;
  };
  properties: Record<string, any>;
}

export interface StreetDataSummary {
  street_id: string;
  street_name: string;
  data_summary: {
    cycling_counts: string;
    cycling_profile: number;
    emergency_calls: string;
  };
}

export async function searchStreets(query: string): Promise<StreetMatch[]> {
  if (!query.trim() || query.length < 2) return [];

  try {
    const url = `${CICLODADOS_BASE}/streets/search?q=${encodeURIComponent(query.trim())}&limit=10`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return [];

    const data: StreetSearchResponse = await response.json();
    return (data.matches || []).map((match) => ({
      id: match.id,
      name: match.name,
      confidence: match.confidence,
      municipality: match.municipality,
      length: match.length,
    }));
  } catch {
    return [];
  }
}

export function computeBoundsFromGeometry(geometry: StreetDetails['geometry']): {
  north: number; south: number; east: number; west: number;
} | undefined {
  const features = geometry?.features;
  if (!features?.length) return undefined;

  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  for (const feature of features) {
    const coords = feature.geometry?.coordinates;
    if (!coords) continue;
    for (const line of coords) {
      for (const [lng, lat] of line) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
    }
  }

  if (!isFinite(minLat)) return undefined;
  return { north: maxLat, south: minLat, east: maxLng, west: minLng };
}

export async function getStreetDetails(streetId: string): Promise<StreetDetails | null> {
  try {
    const url = `${CICLODADOS_BASE}/streets/${streetId}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

export async function getStreetDataSummary(streetId: string): Promise<StreetDataSummary | null> {
  try {
    const url = `${CICLODADOS_BASE}/streets/${streetId}/data-summary`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}