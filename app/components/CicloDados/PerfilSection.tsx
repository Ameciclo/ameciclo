import { useState } from 'react';

interface PerfilSectionProps {
  selectedGenero: string;
  onGeneroChange: (value: string) => void;
  selectedRaca: string;
  onRacaChange: (value: string) => void;
  selectedSocio: string;
  onSocioChange: (value: string) => void;
  selectedDias: string;
  onDiasChange: (value: string) => void;
}

export function PerfilSection({
  selectedGenero,
  onGeneroChange,
  selectedRaca,
  onRacaChange,
  selectedSocio,
  onSocioChange,
  selectedDias,
  onDiasChange
}: PerfilSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const generoOptions = ["Todas", "Masculino", "Feminino"];
  const racaOptions = ["Todas", "Branco", "Preto", "Pardo", "Amarelo", "Indígena"];
  const socioOptions = ["Salários entre X"];
  const diasOptions = ["1 dia", "2 dias", "3 dias", "4 dias", "5 dias", "6 dias", "7 dias"];

  return (
    <div className="bg-white rounded border">
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Perfil de ciclistas</span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-gray-50 rounded p-1 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="px-2 pb-2 space-y-3">
          {/* Gênero */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Gênero</h4>
            <div className="flex gap-1">
              {generoOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onGeneroChange(option)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedGenero === option
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
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
                  className={`px-2 py-1 text-xs rounded ${
                    selectedRaca === option
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
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
                    selectedSocio === option
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
                    selectedDias === option
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