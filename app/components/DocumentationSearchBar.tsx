import { memo, useEffect } from 'react';
import { SearchIcon } from '~/components/Commom/Icones/DocumentationIcons';

interface SearchResult {
  id: string;
  title: string;
  content: string;
}

interface DocumentationSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchResults: SearchResult[];
  onResultClick: (id: string) => void;
  placeholder?: string;
  width?: string;
  darkMode?: boolean;
  enableShortcut?: boolean;
}

function DocumentationSearchBar({
  searchTerm,
  onSearchChange,
  searchResults,
  onResultClick,
  placeholder = "Buscar...",
  width = "w-64",
  darkMode = true,
  enableShortcut = true
}: DocumentationSearchBarProps) {
  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-300'} pl-9 pr-3 py-2 rounded-lg ${width} focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg text-sm`}
      />
      {searchResults.length > 0 && (
        <div className={`absolute top-full mt-2 w-full ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg shadow-xl z-50`}>
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => onResultClick(result.id)}
              className={`w-full text-left px-3 py-2 ${darkMode ? 'hover:bg-gray-700 border-gray-600' : 'hover:bg-gray-100 border-gray-200'} border-b last:border-b-0`}
            >
              <div className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-700'} text-sm`}>{result.title}</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{result.content}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(DocumentationSearchBar);