export default function AgendaLoading() {
  return (
    <div className="container px-4 py-4 mx-auto my-10">
      <div className="px-4 py-4 rounded border border-gray-300">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-48" />
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-300 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}