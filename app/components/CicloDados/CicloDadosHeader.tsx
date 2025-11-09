import { Map, BarChart3, Search, Users, Bike, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchStreets, getStreetDetails, getStreetDataSummary, type StreetMatch, type StreetDataSummary } from '~/services/streets.service';
import { useStreetSelection } from './hooks/useStreetSelection';

interface CicloDadosHeaderProps {
  viewMode: 'map' | 'mural';
  onViewModeChange: (mode: 'map' | 'mural') => void;
  onStreetSelect?: (street: StreetMatch) => void;
  onZoomToStreet?: (bounds: {north: number, south: number, east: number, west: number}, streetGeometry?: any, streetId?: string) => void;
}



export function CicloDadosHeader({ viewMode, onViewModeChange, onStreetSelect, onZoomToStreet }: CicloDadosHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [streetSuggestions, setStreetSuggestions] = useState<StreetMatch[]>([]);
  const [streetDataCache, setStreetDataCache] = useState<Record<string, StreetDataSummary>>({});
  const [streetLengthCache, setStreetLengthCache] = useState<Record<string, number>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { setSelectedStreet } = useStreetSelection();
  const searchRef = useRef<HTMLDivElement>(null);

  const searchStreetsDebounced = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setStreetSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchStreets(query);
        
        // Ordenar apenas por confiabilidade
        const sortedResults = results.sort((a, b) => b.confidence - a.confidence);
        
        setStreetSuggestions(sortedResults);
        
        // Buscar dados e extensão das primeiras 3 sugestões
        const topResults = sortedResults.slice(0, 3);
        topResults.forEach(async (street) => {
          if (!streetDataCache[street.id]) {
            try {
              const [data, details] = await Promise.all([
                getStreetDataSummary(street.id),
                getStreetDetails(street.id)
              ]);
              
              if (data) {
                setStreetDataCache(prev => ({ ...prev, [street.id]: data }));
              }
              
              if (details?.properties?.totalLength) {
                setStreetLengthCache(prev => ({ ...prev, [street.id]: details.properties.totalLength }));
              }
            } catch (error) {
              console.error('Erro ao buscar dados da via:', error);
            }
          }
        });
      } catch (error) {
        console.error('Erro na busca:', error);
        setStreetSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStreetsDebounced(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchStreetsDebounced]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStreetSelect = async (street: StreetMatch) => {
    setSelectedStreet(street.name);
    setSearchTerm('');
    setShowSuggestions(false);
    onStreetSelect?.(street);
    
    // Buscar detalhes e fazer zoom diretamente
    try {
      const streetDetails = await getStreetDetails(street.id);
      if (streetDetails?.geometry?.features && streetDetails.geometry.features.length > 0) {
        // Salvar extensão da via
        if (streetDetails.properties?.totalLength) {
          setStreetLengthCache(prev => ({ ...prev, [street.id]: streetDetails.properties.totalLength }));
        }
        
        const allCoords: number[][] = [];
        
        streetDetails.geometry.features.forEach((feature: any) => {
          if (feature.geometry.type === 'MultiLineString') {
            feature.geometry.coordinates.forEach((lineString: number[][]) => {
              allCoords.push(...lineString);
            });
          }
        });
        
        if (allCoords.length > 0) {
          const lats = allCoords.map(coord => coord[1]);
          const lngs = allCoords.map(coord => coord[0]);
          
          const bounds = {
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs)
          };
          
          onZoomToStreet?.(bounds, streetDetails.geometry, street.id);
        }
      }
    } catch (error) {
      console.error('Erro ao fazer zoom:', error);
    }
  };

  return (
    <header className="flex items-center bg-teal-700 text-white px-2 sm:px-4 py-3 sm:py-2 flex-shrink-0" style={{minHeight: 'auto'}}>
      <div className="flex items-center flex-shrink-0">
        <a href="/dados" className="hover:opacity-80 transition-opacity">
          <img src="/ciclodados/Logo.svg" alt="CicloDados" className="h-8 sm:h-12" />
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center gap-1 sm:gap-4 ml-2 sm:ml-0">
        <button 
          onClick={() => onViewModeChange('map')}
          className={`px-1 sm:px-3 py-1 rounded transition-colors text-xs sm:text-sm flex-shrink-0 flex items-center gap-1 ${
            viewMode === 'map' 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          <Map size={14} />
          <span className="hidden sm:inline">Visualizando no mapa</span>
          <span className="sm:hidden">Mapa</span>
        </button>
        <button 
          onClick={() => onViewModeChange('mural')}
          className={`px-1 sm:px-3 py-1 rounded transition-colors text-xs sm:text-sm flex-shrink-0 flex items-center gap-1 ${
            viewMode === 'mural' 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          <BarChart3 size={14} />
          <span className="hidden sm:inline">Visualizar no mural</span>
          <span className="sm:hidden">Mural</span>
        </button>
        <div className="relative flex-1 max-w-[120px] sm:max-w-xs" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Buscar rua/avenida..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-8 pr-2 py-1 rounded border text-black focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm w-full"
            />
          </div>
          
          {showSuggestions && searchTerm && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b shadow-lg z-[9999] max-h-48 overflow-y-auto">
              {isSearching ? (
                <div className="px-3 py-2 text-gray-500 text-xs flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                  Buscando...
                </div>
              ) : streetSuggestions.length > 0 ? (
                streetSuggestions.map((street) => (
                  <button
                    key={street.id}
                    onClick={() => handleStreetSelect(street)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-black text-xs border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{street.name}</div>
                        <div className="text-gray-500 text-xs">
                          {street.municipality}
                          {streetLengthCache[street.id] && (
                            <span> • {(streetLengthCache[street.id] / 1000).toFixed(1)}km</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {streetDataCache[street.id] && (
                          <>
                            {parseInt(streetDataCache[street.id].data_summary.cycling_counts) > 0 && (
                              <Bike size={12} className="text-green-500" title="Contagens de ciclistas" />
                            )}
                            {streetDataCache[street.id].data_summary.cycling_profile > 0 && (
                              <Users size={12} className="text-blue-500" title="Perfil de ciclistas" />
                            )}
                            {parseInt(streetDataCache[street.id].data_summary.emergency_calls) > 0 && (
                              <AlertTriangle size={12} className="text-red-500" title="Chamadas de emergência" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-xs">Nenhuma via encontrada</div>
              )}
            </div>
          )}
          

        </div>
      </div>
      

    </header>
  );
}