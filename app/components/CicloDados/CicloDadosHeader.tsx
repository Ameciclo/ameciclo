interface CicloDadosHeaderProps {
  viewMode: 'map' | 'mural';
  onViewModeChange: (mode: 'map' | 'mural') => void;
}

export function CicloDadosHeader({ viewMode, onViewModeChange }: CicloDadosHeaderProps) {
  return (
    <header className="flex items-center bg-teal-700 text-white px-4 py-2 flex-shrink-0" style={{minHeight: 'auto'}}>
      <div className="flex items-center">
        <a href="/dados" className="hover:opacity-80 transition-opacity">
          <img src="/ciclodados/Logo.svg" alt="CicloDados" className="h-12" />
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center space-x-4">
        <button 
          onClick={() => onViewModeChange('map')}
          className={`px-3 py-1 rounded transition-colors ${
            viewMode === 'map' 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          Visualizando no mapa
        </button>
        <button 
          onClick={() => onViewModeChange('mural')}
          className={`px-3 py-1 rounded transition-colors ${
            viewMode === 'mural' 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          Visualizar no mural
        </button>
        <input
          type="text"
          placeholder="Buscar local, bairro, rua etc"
          className="px-3 py-1 rounded border text-black focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>
    </header>
  );
}