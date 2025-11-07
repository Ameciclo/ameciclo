import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PerfilSectionProps {
  selectedGenero: string;
  onGeneroChange: (value: string) => void;
  selectedRaca: string;
  onRacaChange: (value: string) => void;
  selectedSocio: string;
  onSocioChange: (value: string) => void;
  selectedDias: string;
  onDiasChange: (value: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PerfilSection({
  selectedGenero,
  onGeneroChange,
  selectedRaca,
  onRacaChange,
  selectedSocio,
  onSocioChange,
  selectedDias,
  onDiasChange,
  isCollapsed = false,
  onToggleCollapse
}: PerfilSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPerfilVisible, setIsPerfilVisible] = useState(true);
  
  // Use external collapse state if provided, otherwise use internal state
  const actuallyExpanded = onToggleCollapse ? !isCollapsed : isExpanded;
  const handleToggleExpanded = onToggleCollapse || (() => setIsExpanded(!isExpanded));
  
  const togglePerfilVisibility = () => {
    setIsPerfilVisible(!isPerfilVisible);
    // Reset all perfil selections when hiding
    if (isPerfilVisible) {
      onGeneroChange('Todas');
      onRacaChange('Todas');
      onSocioChange('Salários entre X');
      onDiasChange('1 dia');
    }
  };
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const generoOptions = ["Todas", "Masculino", "Feminino"];
  const racaOptions = ["Todas", "Branco", "Preto", "Pardo", "Amarelo", "Indígena"];
  const socioOptions = ["Salários entre X"];
  const diasOptions = ["1 dia", "2 dias", "3 dias", "4 dias", "5 dias", "6 dias", "7 dias"];

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
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option === 'Todas' && mounted && (
                    selectedGenero === option ? <Eye size={12} /> : <EyeOff size={12} />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Raça/Cor */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Raça/Cor</h4>
            <div className="flex flex-wrap gap-1">
              {racaOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onRacaChange(option)}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    mounted && selectedRaca === option
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option === 'Todas' && mounted && (
                    selectedRaca === option ? <Eye size={12} /> : <EyeOff size={12} />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Socioeconômico */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Socioeconômico</h4>
            <div className="flex gap-1">
              {socioOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onSocioChange(option)}
                  className={`px-2 py-1 text-xs rounded ${
                    mounted && selectedSocio === option
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Dias que pedala */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quantos dias pedala</h4>
            <div className="grid grid-cols-4 gap-1">
              {diasOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onDiasChange(option)}
                  className={`px-2 py-1 text-xs rounded ${
                    mounted && selectedDias === option
                      ? 'bg-teal-600 text-white'
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