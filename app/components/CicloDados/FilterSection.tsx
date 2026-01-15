import { useState, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PatternDisplay } from './PatternDisplay';





function OptionItem({ 
  option, 
  isSelected, 
  hasPattern, 
  isPdc, 
  onToggle,
  isLoading = false
}: { 
  option: { name: string; color?: string; pattern?: string };
  isSelected: boolean;
  hasPattern: boolean;
  isPdc: boolean;
  onToggle: (option: string) => void;
  isLoading?: boolean;
}) {
  const baseClassName = `${hasPattern ? 'block' : 'flex items-center space-x-2'} p-2 rounded cursor-pointer transition-all duration-200`;
  const defaultClassName = `${baseClassName} hover:bg-gray-50 border border-transparent`;
  const selectedClassName = `${baseClassName} bg-teal-50 border border-teal-200 shadow-sm`;
  
  const handleClick = () => {
    onToggle(option.name);
  };
  
  return (
    <div onClick={handleClick} className={isSelected ? selectedClassName : defaultClassName}>
      {hasPattern ? (
        <>
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex-shrink-0">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              ) : isSelected ? (
                <Eye className="w-4 h-4 text-teal-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className={`text-sm transition-colors ${isSelected ? 'text-teal-700 font-medium' : 'text-gray-700'}`}>
              {option.name}
            </span>
          </div>
          <PatternDisplay 
            pattern={option.pattern || 'solid'} 
            color={option.color || '#000'} 
            name={option.name}
            isPdc={isPdc}
          />
        </>
      ) : (
        <>
          <div className="flex-shrink-0">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            ) : isSelected ? (
              <Eye className="w-4 h-4 text-teal-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm transition-colors ${isSelected ? 'text-teal-700 font-medium' : 'text-gray-700'}`}>
              {option.name}
            </span>
            {option.name === 'Contagem da Prefeitura' && (
              <div className="bg-white text-black px-1 py-0.5 rounded border-2 border-black flex items-center gap-1 text-[8px]">
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9"/>
                  <path d="M13 17V5"/>
                  <path d="M8 17v-3"/>
                </svg>
                <span className="font-bold">0</span>
              </div>
            )}
            {option.name === 'Contagem da Ameciclo' && (
              <div className="bg-green-500 text-white px-1 py-0.5 rounded border-2 border-green-700 flex items-center gap-1 text-[8px]">
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9"/>
                  <path d="M13 17V5"/>
                  <path d="M8 17v-3"/>
                </svg>
                <span className="font-bold">0</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface FilterSectionProps {
  title: string | ReactNode;
  options: Array<{ name: string; color?: string; pattern?: string }>;
  selectedOptions: string[];
  onToggle: (option: string) => void;
  onToggleAll?: (options: string[], selectAll: boolean) => void;
  hasPattern: boolean;
  isPdc?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  comingSoon?: boolean;
  loadingOptions?: string[];
}

export function FilterSection({ 
  title, 
  options, 
  selectedOptions, 
  onToggle, 
  onToggleAll,
  hasPattern,
  isPdc = false,
  isCollapsed = false,
  onToggleCollapse,
  comingSoon = false,
  loadingOptions = []
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  
  // Use external collapse state if provided, otherwise use internal state
  const actuallyExpanded = onToggleCollapse ? !isCollapsed : isExpanded;
  const handleToggleExpanded = onToggleCollapse || (() => setIsExpanded(!isExpanded));
  const isAllSelected = selectedOptions.length === options.length;

  const toggleAll = () => {
    if (isToggling) return; // Prevent multiple simultaneous calls
    
    setIsToggling(true);
    
    try {
      if (onToggleAll) {
        // Use batch operation if available
        const allOptionNames = options.map(opt => opt.name);
        onToggleAll(allOptionNames, !isAllSelected);
      } else {
        // Fallback to individual toggles
        if (isAllSelected) {
          selectedOptions.forEach(optName => onToggle(optName));
        } else {
          options.forEach(opt => {
            if (!selectedOptions.includes(opt.name)) {
              onToggle(opt.name);
            }
          });
        }
      }
    } finally {
      // Reset toggle state after a short delay
      setTimeout(() => setIsToggling(false), 100);
    }
  };

  return (
    <div className="bg-white rounded border relative">
      {comingSoon && (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded" style={{
          animation: 'comingSoonPulse 8s infinite',
        }}>
          <div className="text-center">
            <div className="text-gray-500 font-medium text-sm">
              EM BREVE
            </div>
          </div>
          <style jsx>{`
            @keyframes comingSoonPulse {
              0% { opacity: 1; }
              37.5% { opacity: 1; }
              62.5% { opacity: 0; }
              100% { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={comingSoon ? undefined : (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleAll();
              }} 
              className={`rounded p-1 transition-colors ${
                comingSoon || isToggling ? 'cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
              disabled={comingSoon || isToggling}
              aria-label={isAllSelected ? 'Ocultar todos os itens' : 'Mostrar todos os itens'}
              aria-pressed={isAllSelected}
            >
              {isAllSelected ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            </button>
            <span className="font-medium">{title}</span>
          </div>
          <button 
            onClick={comingSoon ? undefined : handleToggleExpanded}
            className={`rounded p-1 transition-colors ${
              comingSoon ? 'cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
            disabled={comingSoon}
            aria-label={actuallyExpanded ? 'Recolher seção' : 'Expandir seção'}
            aria-expanded={actuallyExpanded}
            aria-controls={`filter-section-${typeof title === 'string' ? title.toLowerCase().replace(/\s+/g, '-') : 'content'}`}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${actuallyExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      {actuallyExpanded && (
        <div 
          className="px-2 pb-2 space-y-1"
          id={`filter-section-${typeof title === 'string' ? title.toLowerCase().replace(/\s+/g, '-') : 'content'}`}
          role="region"
          aria-label={typeof title === 'string' ? `Filtros de ${title}` : 'Filtros'}
        >
          {options.map((option) => (
            <OptionItem 
              key={option.name}
              option={option}
              isSelected={selectedOptions.includes(option.name)}
              hasPattern={hasPattern}
              isPdc={isPdc}
              onToggle={comingSoon ? () => {} : (optionName) => {
                onToggle(optionName);
              }}
              isLoading={loadingOptions.includes(option.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}