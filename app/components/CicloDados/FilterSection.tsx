import { useState } from 'react';
import { PatternDisplay } from './PatternDisplay';

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
          <button
            onClick={toggleAll}
            className={`mb-2 px-2 py-1 text-xs rounded ${
              selectedOptions.length === options.length
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          {options.map((option) => (
            <label key={option.name} className={`${hasPattern ? 'block' : 'flex items-center space-x-2'} p-1 hover:bg-gray-50 rounded cursor-pointer`}>
              {hasPattern ? (
                <>
                  <div className="flex items-center space-x-2 mb-1">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.name)}
                      onChange={() => onToggle(option.name)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{option.name}</span>
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
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.name)}
                    onChange={() => onToggle(option.name)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{option.name}</span>
                </>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}