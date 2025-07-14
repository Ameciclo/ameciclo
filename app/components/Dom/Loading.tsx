function Loading() {
  return (
    <div className="min-h-[50vh] p-8 animate-pulse">
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-300 rounded h-32" />
          ))}
        </div>
        <div className="h-64 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

export default Loading;