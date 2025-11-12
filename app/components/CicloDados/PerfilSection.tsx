import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PerfilSectionProps {
  selectedGenero: string;
  onGeneroChange: (value: string) => void;
  selectedAno: string;
  onAnoChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedIdade: string;
  onIdadeChange: (value: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PerfilSection({
  selectedGenero,
  onGeneroChange,
  selectedAno,
  onAnoChange,
  selectedArea,
  onAreaChange,
  selectedIdade,
  onIdadeChange,
  isCollapsed = false,
  onToggleCollapse
}: PerfilSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPerfilVisible, setIsPerfilVisible] = useState(true);
  
  // TODO: Implementar funcionalidade de perfil em breve
  // Por enquanto, seção comentada para desenvolvimento futuro
  
  // Use external collapse state if provided, otherwise use internal state
  const actuallyExpanded = onToggleCollapse ? !isCollapsed : isExpanded;
  const handleToggleExpanded = onToggleCollapse || (() => setIsExpanded(!isExpanded));
  
  const togglePerfilVisibility = () => {
    setIsPerfilVisible(!isPerfilVisible);
    // Reset all perfil selections when hiding
    if (isPerfilVisible) {
      onGeneroChange('Todos');
      onAnoChange('Todos');
      onAreaChange('Todas');
      onIdadeChange('Todas');
    }
  };
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const generoOptions = ["Todos", "Masculino", "Feminino"];
  const anoOptions = ["Todos", "2024", "2021", "2018", "2015"];
  const areaOptions = ["Todas", "Área 1 - Área Central", "Área 2 - Área Intermediária", "Área 3 - Área Periférica"];
  const idadeOptions = ["Todas", "18-25 anos", "26-35 anos", "36-45 anos", "46+ anos"];

  return (
    <div className="bg-white rounded border">
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={togglePerfilVisibility} className="hover:bg-gray-50 rounded p-1 transition-colors">
              {isPerfilVisible ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            </button>
            <span className="font-medium">Perfil de ciclistas</span>
          </div>
          <button 
            onClick={handleToggleExpanded}
            className="hover:bg-gray-50 rounded p-1 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${actuallyExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      {actuallyExpanded && (
        <div className="px-2 pb-2 space-y-3">
          {/* Gênero */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Gênero</h4>
            <div className="flex gap-1">
              {generoOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onGeneroChange(option)}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    mounted && selectedGenero === option
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option === 'Todos' && mounted && (
                    selectedGenero === option ? <Eye size={12} /> : <EyeOff size={12} />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Ano da Pesquisa */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ano da Pesquisa</h4>
            <div className="flex flex-wrap gap-1">
              {anoOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onAnoChange(option)}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    mounted && selectedAno === option
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option === 'Todos' && mounted && (
                    selectedAno === option ? <Eye size={12} /> : <EyeOff size={12} />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Área da Cidade */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Área da Cidade</h4>
            <div className="flex flex-col gap-1">
              {areaOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onAreaChange(option)}
                  className={`px-2 py-1 text-xs rounded text-left ${
                    mounted && selectedArea === option
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Faixa Etária */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Faixa Etária</h4>
            <div className="flex flex-wrap gap-1">
              {idadeOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onIdadeChange(option)}
                  className={`px-2 py-1 text-xs rounded ${
                    mounted && selectedIdade === option
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}