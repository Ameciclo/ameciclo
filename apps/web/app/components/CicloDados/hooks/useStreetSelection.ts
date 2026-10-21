import { useState, useEffect } from 'react';

const getStoredValue = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(`ciclodados_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export function useStreetSelection() {
  const [selectedStreet, setSelectedStreet] = useState<string>(() => 
    getStoredValue('selectedStreet', "")
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ciclodados_selectedStreet', JSON.stringify(selectedStreet));
    }
  }, [selectedStreet]);

  return {
    selectedStreet,
    setSelectedStreet
  };
}