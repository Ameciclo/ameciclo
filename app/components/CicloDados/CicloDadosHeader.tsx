import { Map, BarChart3 } from 'lucide-react';

interface CicloDadosHeaderProps {
  viewMode: 'map' | 'mural';
  onViewModeChange: (mode: 'map' | 'mural') => void;
}

export function CicloDadosHeader({ viewMode, onViewModeChange }: CicloDadosHeaderProps) {
  return (
    <header className="flex items-center bg-teal-700 text-white px-2 sm:px-4 py-2 flex-shrink-0" style={{minHeight: 'auto'}}>
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
        <input
          type="text"
          placeholder="Buscar"
          className="px-2 sm:px-3 py-1 rounded border text-black focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm min-w-0 flex-1 max-w-xs"
        />
      </div>
    </header>
  );
}