import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePontosContagem } from './usePontosContagem';

interface PerfilPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  total_profiles: number;
  editions: string[];
  distance_from_count_point?: number;
}

export function usePerfilPoints(bounds?: { north: number; south: number; east: number; west: number }) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['perfil-points'],
    queryFn: async () => {
      const knownProfileCoordinates = [
        { lat: -8.09803, lng: -34.91224, name: 'R. Arquiteto Luiz Nunes X R. Eng. Alves de Souza' },
        { lat: -8.03216, lng: -34.88138, name: 'Estrada de Belém x R. Odorico Mendes' },
        { lat: -8.05045, lng: -34.92105, name: 'Av. Caxangá x Av. Gal. San Martin' },
        { lat: -8.05508, lng: -34.88226, name: 'Av. Visconde de Suassuna x R. do Hospício' },
        { lat: -8.05664, lng: -34.89807, name: 'Av. Gov. Agamenon Magalhães x Praça do Derby - Pista Oeste' },
        { lat: -8.05661, lng: -34.89772, name: 'Av. Gov. Agamenon Magalhães x Praça do Derby - Pista Leste' },
        { lat: -8.06046, lng: -34.92576, name: 'Av. Abdias de Carvalho x Av. Gal. San Martin' },
        { lat: -8.10793, lng: -34.92706, name: 'Av. Recife x R. Pintor Antonio de Albuquerque' },
        { lat: -8.10695, lng: -34.92721, name: 'Av. Recife x R. São Nicolau' },
        { lat: -8.0313, lng: -34.95573, name: 'Av. Caxangá x Av. Afonso Olindense' },
        { lat: -8.04448, lng: -34.87489, name: 'Av. Cruz Cabugá x Rua Dr. Jayme da Fonte' },
        { lat: -8.06392, lng: -34.87848, name: 'Av. Guararapes x Av. Dantas Barreto' }
      ];
      
      const perfilPoints: PerfilPoint[] = [];
      
      for (const coord of knownProfileCoordinates) {
        try {
          const response = await fetch(`https://ciclodados.atlas.ameciclo.org/v1/nearby?lat=${coord.lat}&lng=${coord.lng}&radius=200`);
          
          if (response.ok) {
            const profileData = await response.json();
            
            if (profileData.cyclist_profile && profileData.cyclist_profile.total_profiles > 0) {
              perfilPoints.push({
                id: `perfil-${coord.lat}-${coord.lng}`,
                lat: coord.lat,
                lng: coord.lng,
                name: coord.name,
                total_profiles: profileData.cyclist_profile.total_profiles,
                editions: profileData.cyclist_profile.by_edition?.map((e: any) => e.edition) || []
              });
            }
          }
        } catch (err) {
          console.warn(`Erro ao buscar perfil para ${coord.name}:`, err);
        }
      }
      
      return { features: perfilPoints };
    },
    staleTime: 15 * 60 * 1000, // 15 minutos para pontos de perfil
  });

  return { data, loading, error: error?.message || null };
}