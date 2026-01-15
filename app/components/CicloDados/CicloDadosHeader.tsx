import { Search, Users, Bike, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchStreets, getStreetDetails, getStreetDataSummary, type StreetMatch } from '~/services/streets.service';

interface CicloDadosHeaderProps {
  viewMode: 'map' | 'mural';
  onViewModeChange: (mode: 'map' | 'mural') => void;
  onStreetSelect?: (street: StreetMatch) => void;
  onZoomToStreet?: (bounds: {north: number, south: number, east: number, west: number}, streetGeometry?: any, streetId?: string, streetName?: string) => void;
}



export function CicloDadosHeader({ viewMode, onViewModeChange, onStreetSelect, onZoomToStreet }: CicloDadosHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [streetSuggestions, setStreetSuggestions] = useState<StreetMatch[]>([]);
  const [streetDataCache, setStreetDataCache] = useState<Record<string, StreetDataSummary>>({});
  const [streetLengthCache, setStreetLengthCache] = useState<Record<string, number>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<string>('');

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
    
    // Fazer zoom para a rua selecionada usando coordenadas padrão do Recife
    // Como não temos geometria real, vamos usar bounds genéricos baseados no nome
    try {
      let bounds;
      
      // Coordenadas específicas para ruas conhecidas
      if (street.name.toLowerCase().includes('boa viagem')) {
        bounds = {
          north: -8.1100,
          south: -8.1300,
          east: -34.8800,
          west: -34.9100
        };
      } else if (street.name.toLowerCase().includes('conde da boa vista')) {
        bounds = {
          north: -8.0550,
          south: -8.0650,
          east: -34.8750,
          west: -34.8850
        };
      } else {
        // Bounds genéricos para o centro do Recife
        bounds = {
          north: -8.0400,
          south: -8.0600,
          east: -34.8700,
          west: -34.8900
        };
      }
      
      onZoomToStreet?.(bounds, null, street.id, street.name);
      
    } catch (error) {
      console.error('❌ Erro ao fazer zoom:', error);
    }
  };

  return (
    <header className="flex items-center bg-teal-700 text-white px-2 sm:px-4 py-3 sm:py-2 flex-shrink-0" style={{minHeight: 'auto'}}>
      <div className="flex items-center flex-shrink-0">
        <a href="/dados" className="hover:opacity-80 transition-opacity">
          <img src="/ciclodados/Logo.svg" alt="CicloDados" className="h-8 sm:h-12" />
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {selectedStreet && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium border-2 border-red-600 shadow-lg flex items-center gap-2">
            <span>📍 {selectedStreet}</span>
            <button 
              onClick={() => {
                setSelectedStreet('');
                // Notificar componente pai para limpar seleção do mapa
                onZoomToStreet?.({ north: -8.0400, south: -8.0600, east: -34.8700, west: -34.8900 }, null, '', '');
              }}
              className="hover:bg-red-600 rounded-full p-1 transition-colors"
              title="Limpar seleção"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <div className="relative max-w-[200px] sm:max-w-xs" ref={searchRef}>
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