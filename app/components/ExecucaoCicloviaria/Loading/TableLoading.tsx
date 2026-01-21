export const TableLoading = () => {
  return (
    <section className="container mx-auto my-10 shadow-2xl rounded p-6 bg-white">
      <div className="animate-pulse">
        {/* Título da tabela */}
        <div className="h-8 bg-gray-300 rounded w-2/5 mb-6" />
        
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-48" />
          <div className="h-10 bg-gray-200 rounded w-48" />
          <div className="h-10 bg-gray-200 rounded w-48" />
        </div>
        
        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-300 rounded w-32" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-300 rounded w-28" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-300 rounded w-28" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-300 rounded w-24" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-300 rounded w-24" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-28" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};