import { SearchIcon } from "~/components/Commom/Icones/DocumentationIcons";

interface StatusFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  categories: string[];
  darkMode: boolean;
}

export default function StatusFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  categories,
  darkMode
}: StatusFiltersProps) {
  return (
    <div className={`p-4 rounded-lg border mb-6 ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    }`}>
      <h3 className="text-lg font-semibold mb-4 text-green-400">Filtros e Busca</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
              darkMode 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
              darkMode 
                ? "bg-gray-700 border-gray-600 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
              darkMode 
                ? "bg-gray-700 border-gray-600 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Todos os status</option>
            <option value="OK">✅ Online</option>
            <option value="OFF">❌ Offline</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(searchTerm || selectedCategory || selectedStatus) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm opacity-75">Filtros ativos:</span>
          {searchTerm && (
            <span className={`px-2 py-1 rounded text-xs ${
              darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
            }`}>
              Busca: "{searchTerm}"
            </span>
          )}
          {selectedCategory && (
            <span className={`px-2 py-1 rounded text-xs ${
              darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
            }`}>
              Categoria: {selectedCategory}
            </span>
          )}
          {selectedStatus && (
            <span className={`px-2 py-1 rounded text-xs ${
              selectedStatus === "OK" 
                ? darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                : darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
            }`}>
              Status: {selectedStatus === "OK" ? "Online" : "Offline"}
            </span>
          )}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedStatus("");
            }}
            className="px-2 py-1 rounded text-xs bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}