import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PatternDisplay } from './PatternDisplay';





function OptionItem({ 
  option, 
  isSelected, 
  hasPattern, 
  isPdc, 
  onToggle 
}: { 
  option: { name: string; color?: string; pattern?: string };
  isSelected: boolean;
  hasPattern: boolean;
  isPdc: boolean;
  onToggle: (option: string) => void;
}) {
  const baseClassName = `${hasPattern ? 'block' : 'flex items-center space-x-2'} p-2 rounded cursor-pointer transition-all duration-200`;
  const defaultClassName = `${baseClassName} hover:bg-gray-50 border border-transparent`;
  const selectedClassName = `${baseClassName} bg-teal-50 border border-teal-200 shadow-sm`;
  
  return (
    <div onClick={() => onToggle(option.name)} className={isSelected ? selectedClassName : defaultClassName}>
      {hasPattern ? (
        <>
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex-shrink-0">
              {isSelected ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
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
            {isSelected ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          </div>
          <span className={`text-sm transition-colors ${isSelected ? 'text-teal-700 font-medium' : 'text-gray-700'}`}>
            {option.name}
          </span>
        </>
      )}
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  options: Array<{ name: string; color?: string; pattern?: string }>;
  selectedOptions: string[];
  onToggle: (option: string) => void;
  hasPattern: boolean;
  isPdc?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FilterSection({ 
  title, 
  options, 
  selectedOptions, 
  onToggle, 
  hasPattern,
  isPdc = false,
  isCollapsed = false,
  onToggleCollapse
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Use external collapse state if provided, otherwise use internal state
  const actuallyExpanded = onToggleCollapse ? !isCollapsed : isExpanded;
  const handleToggleExpanded = onToggleCollapse || (() => setIsExpanded(!isExpanded));
  const isAllSelected = selectedOptions.length === options.length;

  const toggleAll = () => {
    if (isAllSelected) {
      // Deselect all - call toggle for each selected option
      selectedOptions.forEach(optName => onToggle(optName));
    } else {
      // Select all - call toggle for each unselected option
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
          <div className="flex items-center gap-2">
            <button onClick={toggleAll} className="hover:bg-gray-50 rounded p-1 transition-colors">
              {isAllSelected ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            </button>
            <span className="font-medium">{title}</span>
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
        <div className="px-2 pb-2 space-y-1">
          {options.map((option) => (
            <OptionItem 
              key={option.name}
              option={option}
              isSelected={selectedOptions.includes(option.name)}
              hasPattern={hasPattern}
              isPdc={isPdc}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}