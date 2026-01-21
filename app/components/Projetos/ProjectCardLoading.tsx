export const ProjectCardLoading = () => {
  return (
    <div className="bg-white rounded-lg shadow relative animate-pulse" style={{ minHeight: "450px" }}>
      <div className="absolute top-0 left-0">
        <div className="p-4 bg-gray-300 rounded" style={{ borderRadius: "0 0 15px 0", width: "120px", height: "50px" }} />
      </div>
      <div className="bg-gray-300" style={{ minHeight: "270px" }} />
      <div className="px-4 py-5 lg:p-6">
        <div className="pb-6">
          <div className="h-8 bg-gray-300 rounded mb-2" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};