import { useState, useEffect } from 'react';
import { PatternDisplay } from './PatternDisplay';

function EyeIcon({ isVisible }: { isVisible: boolean }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="w-4 h-4" />;
  }
  
  return (
    <svg className={`w-4 h-4 ${isVisible ? 'text-teal-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {isVisible ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      )}
    </svg>
  );
}

function ToggleAllButton({ isAllSelected, onClick }: { isAllSelected: boolean; onClick: () => void }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <button className="mb-2 px-2 py-1 text-xs rounded flex items-center gap-1 bg-gray-200 text-gray-700">
        <div className="w-4 h-4" />
        Todas
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`mb-2 px-2 py-1 text-xs rounded flex items-center gap-1 ${
        isAllSelected
          ? 'bg-teal-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <EyeIcon isVisible={isAllSelected} />
      Todas
    </button>
  );
}

function OptionText({ isSelected, text }: { isSelected: boolean; text: string }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <span className="text-sm transition-colors text-gray-700">{text}</span>;
  }
  
  return (
    <span className={`text-sm transition-colors ${isSelected ? 'text-teal-700 font-medium' : 'text-gray-700'}`}>
      {text}
    </span>
  );
}

interface FilterSectionProps {
  title: string;
  options: Array<{ name: string; color?: string; pattern?: string }>;
  selectedOptions: string[];
  onToggle: (option: string) => void;
  hasPattern: boolean;
  isPdc?: boolean;
}

export function FilterSection({ 
  title, 
  options, 
  selectedOptions, 
  onToggle, 
  hasPattern,
  isPdc = false 
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleAll = () => {
    if (selectedOptions.length === options.length) {
      options.forEach(opt => onToggle(opt.name));
    } else {
      options.forEach(opt => {
        if (!selectedOptions.includes(opt.name)) {
          onToggle(opt.name);
        }
      });
    }
  };

  return (
    <div className="bg-white rounded border">
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{title}</span>
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
        <div className="px-2 pb-2 space-y-1">
          <ToggleAllButton 
            isAllSelected={selectedOptions.length === options.length}
            onClick={toggleAll}
          />
          {options.map((option) => (
            <div key={option.name} onClick={() => onToggle(option.name)} className={`${hasPattern ? 'block' : 'flex items-center space-x-2'} p-2 rounded cursor-pointer transition-all duration-200 ${selectedOptions.includes(option.name) ? 'bg-teal-50 border border-teal-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}>
              {hasPattern ? (
                <>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-shrink-0">
                      <EyeIcon isVisible={selectedOptions.includes(option.name)} />
                    </div>
                    <OptionText isSelected={selectedOptions.includes(option.name)} text={option.name} />
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
                    <EyeIcon isVisible={selectedOptions.includes(option.name)} />
                  </div>
                  <OptionText isSelected={selectedOptions.includes(option.name)} text={option.name} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}