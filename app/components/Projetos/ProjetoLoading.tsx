const Skeleton = () => <div className="bg-gray-300 rounded animate-pulse"></div>;

const ProjetoLoading = () => {
  return (
    <>
      <div className="w-full h-96 bg-gray-300 animate-pulse"></div>
      <div className="container mx-auto mt-8 mb-8">
        <div className="flex flex-wrap items-center justify-center p-16 mx-auto my-auto text-white rounded bg-gray-400 animate-pulse lg:mx-0">
          <div className="w-full lg:w-1/2 lg:pr-5 lg:mb-0">
            <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="w-full lg:w-1/2 lg:mb-0">
            <div className="flex flex-col items-center justify-center w-full pt-4 mt-6 lg:pt-4 lg:flex-row">
              <div className="p-3 mr-4 text-center">
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse mb-2"></div>
                <div className="flex">
                  <div className="w-6 h-6 bg-gray-300 rounded-full m-1 animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full m-1 animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full m-1 animate-pulse"></div>
                </div>
              </div>
              <div className="p-3 mr-4 text-center">
                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse mb-2"></div>
                <div className="flex">
                  <div className="w-6 h-6 bg-gray-300 rounded-full m-1 animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full m-1 animate-pulse"></div>
                </div>
              </div>
              <div className="p-3 text-center lg:mr-4">
                <div className="h-4 bg-gray-300 rounded w-28 animate-pulse mb-2"></div>
                <div className="flex">
                  <div className="w-6 h-6 bg-gray-300 rounded-full m-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="container mx-auto my-10">
        <div className="flex flex-col bg-white rounded-lg shadow-xl p-6">
          <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-full animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
        </div>
      </section>
    </>
  );
};

export default ProjetoLoading;