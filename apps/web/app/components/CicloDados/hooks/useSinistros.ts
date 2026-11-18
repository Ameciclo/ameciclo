interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

type SinistrosCollection = { features: { geometry: { coordinates: [number, number] }; properties: Record<string, unknown> }[] };

// A camada de sinistros com vítima ainda não tem fonte de dados ("Em breve" no painel): sempre vazia, sem dado de exemplo.
export function useSinistros(_bounds?: ViewportBounds | null): { data: SinistrosCollection | null; error: string | null } {
  return { data: null, error: null };
}
