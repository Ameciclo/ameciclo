export default function SamuLoading() {
  return (
    <div className="min-h-[50vh] p-8 animate-pulse">
      <div className="space-y-8">
        <div className="h-8 bg-gray-300 rounded w-2/3 mx-auto" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-300 rounded h-32" />
          ))}
        </div>
        
        <div className="h-96 bg-gray-300 rounded" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-gray-300 rounded h-64" />
          ))}
        </div>
      </div>
    </div>
  );
}
