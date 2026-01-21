import { useState } from "react";

interface FilterOptions {
  anoInicio: number;
  anoFim: number;
  limite: number;
  desfechos: 'validos' | 'invalidos' | 'todos';
  intervalo: number;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading?: boolean;
}

export default function AdvancedFilters({ onFiltersChange, isLoading = false }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    anoInicio: 2018,
    anoFim: 2024,
    limite: 50,
    desfechos: 'validos',
    intervalo: 1
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: currentYear - 2015 }, (_, i) => 2016 + i);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Validações
    if (key === 'anoInicio' && value > newFilters.anoFim) {
      newFilters.anoFim = value;
    }
    if (key === 'anoFim' && value < newFilters.anoInicio) {
      newFilters.anoInicio = value;
    }
    
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      anoInicio: 2018,
      anoFim: 2024,
      limite: 50,
      desfechos: 'validos',
      intervalo: 1
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const isDefaultFilters = () => {
    return filters.anoInicio === 2018 && 
           filters.anoFim === 2024 && 
           filters.limite === 50 && 
           filters.desfechos === 'validos' && 
           filters.intervalo === 1;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filtros Avançados</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label={isExpanded ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
          aria-expanded={isExpanded}
          aria-controls="advanced-filters-content"
        >
          <span>{isExpanded ? 'Ocultar' : 'Mostrar'} Filtros</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Resumo dos filtros ativos */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Filtros ativos:</span> 
          {` ${filters.anoInicio}-${filters.anoFim} • `}
          {`Top ${filters.limite} vias • `}
          {`Desfechos ${filters.desfechos} • `}
          {`Intervalo ${filters.intervalo}`}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6" id="advanced-filters-content" role="region" aria-label="Filtros avançados">
          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Período de Análise
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ano Inicial</label>
                <select
                  value={filters.anoInicio}
                  onChange={(e) => handleFilterChange('anoInicio', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ameciclo"
                  disabled={isLoading}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ano Final</label>
                <select
                  value={filters.anoFim}
                  onChange={(e) => handleFilterChange('anoFim', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ameciclo"
                  disabled={isLoading}
                >
                  {availableYears.filter(year => year >= filters.anoInicio).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Limite de vias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Número de Vias para Análise
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={filters.limite}
                onChange={(e) => handleFilterChange('limite', parseInt(e.target.value))}
                className="flex-1"
                disabled={isLoading}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={filters.limite}
                  onChange={(e) => handleFilterChange('limite', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">vias</span>
              </div>
            </div>
          </div>

          {/* Tipo de desfechos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Desfechos
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'validos', label: 'Válidos', description: 'Apenas desfechos confirmados' },
                { value: 'invalidos', label: 'Inválidos', description: 'Desfechos não confirmados' },
                { value: 'todos', label: 'Todos', description: 'Todos os tipos de desfecho' }
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    filters.desfechos === option.value
                      ? 'border-ameciclo bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="desfechos"
                    value={option.value}
                    checked={filters.desfechos === option.value}
                    onChange={(e) => handleFilterChange('desfechos', e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Intervalo de agrupamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Intervalo de Agrupamento
            </label>
            <select
              value={filters.intervalo}
              onChange={(e) => handleFilterChange('intervalo', parseInt(e.target.value))}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ameciclo"
              disabled={isLoading}
            >
              <option value={1}>1 (Dados anuais)</option>
              <option value={2}>2 (Biênios)</option>
              <option value={3}>3 (Triênios)</option>
              <option value={5}>5 (Quinquênios)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Agrupa os dados em intervalos de anos para análises de tendência
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={applyFilters}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-6 py-3 bg-ameciclo text-white rounded-lg hover:bg-teal-700 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Aplicando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Aplicar Filtros</span>
                </>
              )}
            </button>
            
            <button
              onClick={resetFilters}
              disabled={isLoading || isDefaultFilters()}
              className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${
                (isLoading || isDefaultFilters()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Resetar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}