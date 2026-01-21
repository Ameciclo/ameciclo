export default function SectionCarouselLoading() {
  return (
    <section className="relative min-h-[300px] md:min-h-[400px]">
      <div className="w-full h-full bg-gray-300 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="rounded-lg bg-white/90 max-w-[320px] md:max-w-[800px] w-full animate-pulse">
          <div className="p-4 md:p-6">
            <div className="h-8 md:h-16 bg-gray-300 rounded mb-4" />
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded w-4/5" />
                <div className="h-4 bg-gray-300 rounded w-3/5" />
              </div>
              <div className="flex justify-center mt-4">
                <div className="h-4 bg-gray-300 rounded w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="w-8 h-1 bg-gray-400/60 rounded animate-pulse" />
        ))}
      </div>
    </section>
  );
}