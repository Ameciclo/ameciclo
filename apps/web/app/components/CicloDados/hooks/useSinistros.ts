import { useState, useEffect } from 'react';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useSinistros(bounds?: ViewportBounds) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No mock data - return empty data
    setData(null);
    setError(null);
  }, [bounds]);

  return { data, error };
}