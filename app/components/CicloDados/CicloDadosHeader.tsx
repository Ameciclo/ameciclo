import { Map, BarChart3, Search } from 'lucide-react';
import { useState } from 'react';

interface CicloDadosHeaderProps {
  viewMode: 'map' | 'mural';
  onViewModeChange: (mode: 'map' | 'mural') => void;
}

// Dados fictícios das ruas do Recife com informações de disponibilidade
const MOCK_STREETS_DATA = {
  "Av. Gov. Agamenon Magalhães": {
    hasMapData: true,
    hasDashboardData: true,
    contagens: { value: "2.846", description: "contagens de ciclistas (Jan/2024)" },
    sinistros: { value: "12", description: "vítimas fatais (2024)" },
    infraestrutura: { value: "85%", description: "infra. cicloviária executada" }
  },
  "Av. Boa Viagem": {
    hasMapData: true,
    hasDashboardData: true,
    contagens: { value: "1.523", description: "contagens de ciclistas (Jan/2024)" },
    sinistros: { value: "8", description: "vítimas fatais (2024)" },
    infraestrutura: { value: "45%", description: "infra. cicloviária executada" }
  },
  "Av. Conde da Boa Vista": {
    hasMapData: true,
    hasDashboardData: false,
    contagens: null,
    sinistros: { value: "3", description: "vítimas fatais (2024)" },
    infraestrutura: { value: "12%", description: "infra. cicloviária executada" }
  },
  "Rua da Aurora": {
    hasMapData: false,
    hasDashboardData: true,
    contagens: { value: "892", description: "contagens de ciclistas (Jan/2024)" },
    sinistros: { value: "2", description: "vítimas fatais (2024)" },
    infraestrutura: { value: "78%", description: "infra. cicloviária executada" }
  },
  "Av. Caxangá": {
    hasMapData: true,
    hasDashboardData: true,
    contagens: { value: "3.124", description: "contagens de ciclistas (Jan/2024)" },
    sinistros: { value: "15", description: "vítimas fatais (2024)" },
    infraestrutura: { value: "32%", description: "infra. cicloviária executada" }
  },
  "Rua do Hospício": {
    hasMapData: false,
    hasDashboardData: false,
    contagens: null,
    sinistros: null,
    infraestrutura: null
  }
};

export function CicloDadosHeader({ viewMode, onViewModeChange }: CicloDadosHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStreet, setSelectedStreet] = useState<string>('Av. Gov. Agamenon Magalhães');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredStreets = Object.keys(MOCK_STREETS_DATA).filter(street =>
    street.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStreetSelect = (street: string) => {
    setSelectedStreet(street);
    setSearchTerm('');
    setShowSuggestions(false);
    console.log('Rua selecionada:', street, 'Dados:', MOCK_STREETS_DATA[street as keyof typeof MOCK_STREETS_DATA]);
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
        <div className="relative flex-1 max-w-[120px] sm:max-w-xs">
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
              {filteredStreets.length > 0 ? (
                filteredStreets.map((street) => {
                  const streetData = MOCK_STREETS_DATA[street as keyof typeof MOCK_STREETS_DATA];
                  return (
                    <button
                      key={street}
                      onClick={() => handleStreetSelect(street)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-black text-xs border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{street}</div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-gray-500 text-xs">Nenhuma rua encontrada</div>
              )}
            </div>
          )}
          

        </div>
      </div>
    </header>
  );
}