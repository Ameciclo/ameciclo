export default function LoaLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Investimentos e Emissões */}
      <section className="mb-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-gray-300">
                <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Orçado vs Executado */}
      <section className="mb-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-80 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-gray-300">
                <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-5 bg-gray-300 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {[1, 2].map((i) => (
          <section key={i} className="h-auto">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Tabela */}
      <section>
        <div className="animate-pulse">
          <div className="bg-gray-100 rounded p-2 sm:p-12">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            
            {/* Tags de filtro */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-300 rounded-full w-24"></div>
              ))}
            </div>
            
            {/* Tabela skeleton */}
            <div className="bg-white rounded-lg shadow">
              <div className="h-12 bg-gray-200 rounded-t-lg mb-2"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}