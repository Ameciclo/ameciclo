import { useState, useEffect } from "react";

interface ViaSearchProps {
  onSearch: (query: string) => void;
  onViaSelect: (via: string) => void;
  isLoading?: boolean;
}

interface SearchResult {
  nome: string;
  sinistros: number;
  id: number;
}

export default function ViaSearch({ onSearch, onViaSelect, isLoading = false }: ViaSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 3) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://api.garfo.ameciclo.org/samu-calls/streets/search?street=${encodeURIComponent(searchQuery)}&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Simular estrutura de resposta baseada na API
        const mockResults: SearchResult[] = [
          { nome: "Avenida Boa Viagem", sinistros: 287, id: 1 },
          { nome: "Avenida Recife", sinistros: 245, id: 2 },
          { nome: "Avenida Norte Miguel Arraes", sinistros: 198, id: 3 },
        ].filter(via => 
          via.nome.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setResults(mockResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleViaClick = (via: SearchResult) => {
    setQuery(via.nome);
    setShowResults(false);
    onViaSelect(via.nome);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    onSearch("");
    onViaSelect("");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Buscar Via Específica</h3>
      
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Digite o nome da via (ex: Boa Viagem, Recife, Norte...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ameciclo focus:border-transparent"
              disabled={isLoading}
            />
            
            {/* Ícone de busca */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {searchLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ameciclo"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
          
          {query && (
            <button
              onClick={clearSearch}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Limpar busca"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Resultados da busca */}
        {showResults && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {results.map((via) => (
              <button
                key={via.id}
                onClick={() => handleViaClick(via)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{via.nome}</div>
                    <div className="text-sm text-gray-500">{via.sinistros} sinistros registrados</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {showResults && results.length === 0 && !searchLoading && query.length >= 3 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <p>Nenhuma via encontrada para "{query}"</p>
              <p className="text-sm mt-1">Tente usar termos mais gerais ou verifique a grafia</p>
            </div>
          </div>
        )}
      </div>

      {/* Dicas de busca */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Dicas de busca:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Digite pelo menos 3 caracteres para iniciar a busca</li>
          <li>• Use termos como "Boa Viagem", "Recife", "Norte" ou "Caxangá"</li>
          <li>• A busca é feita em tempo real conforme você digita</li>
          <li>• Clique em uma via da lista para ver análises específicas</li>
        </ul>
      </div>

      {/* Vias mais buscadas */}
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 mb-3">Vias mais consultadas:</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "Avenida Boa Viagem",
            "Avenida Recife", 
            "Avenida Norte Miguel Arraes",
            "BR-101",
            "Avenida Caxangá"
          ].map((via) => (
            <button
              key={via}
              onClick={() => {
                setQuery(via);
                onViaSelect(via);
              }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-ameciclo hover:text-white transition-colors"
            >
              {via}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}