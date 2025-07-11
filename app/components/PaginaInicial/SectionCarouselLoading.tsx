export default function SectionCarouselLoading() {
  return (
    <section>
      <div className="">

        <div className="relative">

          <div className="flex min-h-[300px] md:min-h-[400px] relative w-full animate-pulse">
            <div className="w-full h-full bg-gray-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-0">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-2">Projetos em Destaque</h2>
                <p className="text-gray-600">Carregando projetos...</p>
              </div>
              <div className="rounded-lg shadow-xl bg-white bg-opacity-80 max-w-[320px] md:max-w-[850px] w-full">
                <div className="flex items-center justify-center mt-3 md:mt-5">
                  <div className="h-6 md:h-12 lg:h-16 bg-gray-300 rounded w-3/4" />
                </div>
                <div className="mt-3 md:mt-5 border-t border-gray-300">
                  <div className="p-3 md:p-6 md:pr-24 md:pl-16 md:py-6">
                    <div className="space-y-2">
                      <div className="h-4 md:h-5 bg-gray-300 rounded" />
                      <div className="h-4 md:h-5 bg-gray-300 rounded w-5/6" />
                      <div className="h-4 md:h-5 bg-gray-300 rounded w-4/6" />
                    </div>
                    <div className="flex justify-center mt-2 md:mt-3">
                      <div className="h-4 md:h-5 bg-gray-300 rounded w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="dots-container">
            <div className="dots">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="dot bg-gray-300" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}