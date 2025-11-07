import { useState, useEffect } from 'react';
import { cicloDadosService, type CicloDadosFilters, type DataAvailability } from '~/services/ciclodados.service';

interface MapSelection {
  lat: number;
  lng: number;
  radius: number;
  street?: string;
}

interface CardData {
  id: string;
  title: string;
  value: string;
  hasData: boolean;
  chart?: React.ReactNode;
  description?: string;
  metrics?: Array<{label: string, value: string, trend?: 'up'|'down'}>;
}

export function useMapSelection() {
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [dataAvailability, setDataAvailability] = useState<DataAvailability | null>(null);
  const [cardData, setCardData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSelection = (coords: MapSelection) => {
    setSelection(coords);
  };

  // Check data availability when selection changes
  useEffect(() => {
    if (!selection) return;

    const checkAvailability = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const availability = await cicloDadosService.checkDataAvailability(selection);
        setDataAvailability(availability);
        
        // Get available card IDs
        const availableCardIds = Object.keys(availability.available)
          .filter(key => availability.available[key as keyof typeof availability.available]);
        
        // Fetch data for available cards
        if (availableCardIds.length > 0) {
          const filters: CicloDadosFilters = {
            lat: selection.lat,
            lng: selection.lng,
            radius: selection.radius,
            street: selection.street
          };
          
          const data = await cicloDadosService.getMultipleCards(availableCardIds, filters);
          setCardData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching card data:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [selection]);

  const getAvailableCards = (): string[] => {
    if (!dataAvailability) return [];
    
    return Object.keys(dataAvailability.available)
      .filter(key => dataAvailability.available[key as keyof typeof dataAvailability.available]);
  };

  const hasDataForCard = (cardId: string): boolean => {
    return dataAvailability?.available[cardId as keyof typeof dataAvailability.available] ?? false;
  };

  const getCardData = (cardId: string) => {
    return cardData[cardId] || null;
  };

  return {
    selection,
    updateSelection,
    dataAvailability,
    cardData,
    loading,
    error,
    getAvailableCards,
    hasDataForCard,
    getCardData
  };
}