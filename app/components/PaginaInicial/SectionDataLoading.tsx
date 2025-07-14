export default function SectionDataLoading() {
  return (
    <section className="bg-ameciclo">
      <div className="container px-6 py-20 mx-auto">
        <div className="flex flex-wrap justify-around">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-2 m-2 md:p-4 md:m-4 text-center text-white uppercase transform hover:scale-105 transition-transform duration-200">
              <div 
                className="bg-white/20 rounded h-16 md:h-24 w-32 md:w-48 mx-auto mb-2 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear'
                }}
              />
              <div 
                className="bg-white/20 rounded h-6 md:h-8 w-40 md:w-56 mx-auto relative overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: `${index * 0.2}s`
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </section>
  );
}