export default function AmeciclistasLoading() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 cursor-pointer">
          <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
            <div className="relative w-full h-64 overflow-hidden">
              <div className="animate-pulse bg-gray-300 absolute w-full h-full" />
            </div>
            <div className="p-6 flex-1">
              <div className="animate-pulse bg-gray-300 rounded h-6 mb-2" />
              <div className="animate-pulse bg-gray-300 rounded h-4" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
