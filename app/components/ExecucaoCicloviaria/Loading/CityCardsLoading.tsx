export const CityCardsLoading = () => {
  return (
    <section className="container mx-auto my-10">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="h-6 bg-gray-300 rounded mb-2" />
              <div className="h-8 bg-gray-300 rounded mb-2" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};