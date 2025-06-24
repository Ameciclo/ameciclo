import { memo } from 'react';
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
}

function DocumentationSearchBar({
  searchTerm,
  onSearchChange,
  searchResults,
  onResultClick,
  placeholder = "Buscar...",
  width = "w-64"
}: DocumentationSearchBarProps) {
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
        className={`bg-gray-700 text-white pl-9 pr-3 py-2 rounded-lg ${width} focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg text-sm`}
      />
      {searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => onResultClick(result.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
            >
              <div className="font-medium text-green-400 text-sm">{result.title}</div>
              <div className="text-xs text-gray-400 truncate">{result.content}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(DocumentationSearchBar);