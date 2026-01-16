export default function InfoSectionLoading() {
  return (
    <div className="flex flex-wrap p-16 mx-auto text-white rounded bg-ameciclo lg:mx-0">
      <div className="w-full mb-4 lg:pr-5 lg:w-1/2 lg:mb-0">
        <div className="animate-pulse bg-white/20 rounded h-8 mb-4" />
        <div className="animate-pulse bg-white/20 rounded h-6 mb-2" />
        <div className="animate-pulse bg-white/20 rounded h-6 w-3/4" />
      </div>
      <div className="w-full mb-4 lg:w-1/2 lg:mb-0">
        <div className="animate-pulse bg-white/20 rounded h-4 mb-4" />
        <div className="flex flex-wrap gap-2">
          <div className="animate-pulse bg-white/20 rounded h-8 w-20" />
          <div className="animate-pulse bg-white/20 rounded h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
