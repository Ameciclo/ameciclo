export default function QuemSomosLoading() {
  return (
    <div className="container mx-auto mt-8 mb-8">
      <div className="flex flex-wrap p-16 mx-auto text-white rounded bg-ameciclo lg:mx-0">
        <div className="w-full mb-4 lg:pr-5 lg:w-1/2 lg:mb-0">
          <div className="animate-pulse bg-white/20 rounded h-8 mb-4" />
          <div className="animate-pulse bg-white/20 rounded h-6 mb-2" />
          <div className="animate-pulse bg-white/20 rounded h-6 w-3/4" />
        </div>
        <div className="w-full mb-4 lg:w-1/2 lg:mb-0">
          <div className="animate-pulse bg-white/20 rounded h-4 mb-4" />
          <div className="flex flex-wrap gap-2">
            <div className="animate-pulse bg-white/20 rounded h-8 w-20" />
            <div className="animate-pulse bg-white/20 rounded h-8 w-24" />
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex border-b mb-6">
          <div className="animate-pulse bg-gray-300 rounded h-10 w-32 mr-4" />
          <div className="animate-pulse bg-gray-300 rounded h-10 w-28 mr-4" />
          <div className="animate-pulse bg-gray-300 rounded h-10 w-36" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="max-w-sm p-4">
              <div className="bg-white rounded shadow-lg" style={{ minHeight: "450px" }}>
                <div className="animate-pulse bg-gray-300 h-64 rounded-t" />
                <div className="p-4 pb-6">
                  <div className="animate-pulse bg-gray-300 rounded h-6 mb-2" />
                  <div className="animate-pulse bg-gray-300 rounded h-4 mb-1" />
                  <div className="animate-pulse bg-gray-300 rounded h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}