export const CardLoading = () => (
  <div className="bg-white rounded-lg shadow-lg p-4 border-l-8 border-gray-300 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
    <div className="h-10 bg-gray-200 rounded w-24 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
  </div>
);

export const ChartLoading = () => (
  <section className="h-auto">
    <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </section>
);
