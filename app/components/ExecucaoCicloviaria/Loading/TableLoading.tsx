export const TableLoading = () => {
  return (
    <section className="container mx-auto my-10 shadow-2xl rounded p-2 sm:p-12 overflow-auto bg-gray-100">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4" />
        <div className="shadow overflow-hidden bg-white border-b border-gray-200 sm:rounded-lg">
          <div className="bg-gray-100 px-6 py-3">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-4 bg-gray-300 rounded" />
              ))}
            </div>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="px-6 py-4">
                <div className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-300 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};