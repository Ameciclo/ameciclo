import { SearchIcon } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
}

interface DocumentationSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  onResultClick: (id: string) => void;
}

export default function DocumentationSearchBar({
  searchTerm,
  setSearchTerm,
  searchResults,
  onResultClick
}: DocumentationSearchBarProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar na documentação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => onResultClick(result.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                >
                  <div className="font-medium text-green-400">{result.title}</div>
                  <div className="text-sm text-gray-400 truncate">{result.content}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}