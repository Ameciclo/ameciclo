export const StatisticsBoxLoading = () => {
  return (
    <section className="container mx-auto my-10">
      <div className="text-center mb-8 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-2" />
        <div className="h-6 bg-gray-300 rounded w-1/4 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-4" />
            <div className="h-4 bg-gray-300 rounded mb-2" />
            <div className="h-6 bg-gray-300 rounded w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
};