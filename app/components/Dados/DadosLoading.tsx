export default function DadosLoading() {
  return (
    <>
      {/* Explanation Box Loading */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-gray-300 rounded h-8 w-64 mx-auto mb-6" />
            <div className="bg-gray-300 rounded h-4 mb-2" />
            <div className="bg-gray-300 rounded h-4 w-5/6 mx-auto" />
          </div>
        </div>
      </section>
      
      {/* Cards Session Loading */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse mb-8">
            <div className="bg-gray-300 rounded h-8 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="bg-gray-300 rounded h-16 w-16 mx-auto mb-4" />
                <div className="bg-gray-300 rounded h-6 mb-3" />
                <div className="space-y-2">
                  <div className="bg-gray-300 rounded h-4" />
                  <div className="bg-gray-300 rounded h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Images Grid Loading */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse mb-8">
            <div className="bg-gray-300 rounded h-8 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="bg-gray-300 h-48" />
                <div className="p-4">
                  <div className="bg-gray-300 rounded h-5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}