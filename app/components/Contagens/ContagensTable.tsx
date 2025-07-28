import { Link } from "@remix-run/react";
import React, { useState, useEffect, useMemo } from "react";
import type { ContagemData } from "~/services/contagens.service";
import { IntlDateStr } from "~/services/utils";

interface ContagensTableProps {
  data: ContagemData[];
}

export function ContagensTable({ data }: ContagensTableProps) {
  const [cyclistFilter, setCyclistFilter] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
  const [nameFilter, setNameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredData, setFilteredData] = useState(data);
  
  const pageSize = 10;

  const minMax = useMemo(() => {
    if (!data.length) return [0, 0];
    const values = data.map(d => d.total_cyclists);
    return [Math.min(...values), Math.max(...values)];
  }, [data]);

  useEffect(() => {
    let filtered = data;

    // Filtro por nome
    if (nameFilter) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Filtro por total de ciclistas
    if (cyclistFilter[0] || cyclistFilter[1]) {
      filtered = filtered.filter(item => {
        const value = item.total_cyclists;
        const min = cyclistFilter[0] || 0;
        const max = cyclistFilter[1] || Infinity;
        return value >= min && value <= max;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(0);
  }, [cyclistFilter, nameFilter, data]);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <section className="container mx-auto my-10 shadow-2xl rounded p-2 sm:p-12 overflow-auto bg-gray-100">
      <h2 className="text-gray-600 text-3xl mb-4">Nossas contagens</h2>
      
      {/* Filtros */}
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <input
            className="px-4 py-2 border border-gray-300 rounded"
            type="text"
            placeholder="Buscar por nome"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          
          <label className="text-gray-700 font-medium">Filtrar por Total de Ciclistas:</label>
          <div className="flex items-center gap-2">
            <input
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
              type="number"
              placeholder={`Min(${minMax[0]})`}
              value={cyclistFilter[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                setCyclistFilter(prev => [val ? parseInt(val) : undefined, prev[1]]);
              }}
            />
            <span className="text-gray-500">a</span>
            <input
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
              type="number"
              placeholder={`Max(${minMax[1]})`}
              value={cyclistFilter[1] || ''}
              onChange={(e) => {
                const val = e.target.value;
                setCyclistFilter(prev => [prev[0], val ? parseInt(val) : undefined]);
              }}
            />
            <button
              className="px-3 py-1 bg-ameciclo text-white rounded hover:bg-opacity-80"
              onClick={() => setCyclistFilter([undefined, undefined])}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="shadow overflow-x-auto bg-white border-b border-gray-200 sm:rounded-lg">
        <table className="table-auto shadow min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total de Ciclistas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Dados
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <Link
                    className="text-ameciclo hover:underline"
                    to={`/dados/contagens/${item.slug}`}
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {IntlDateStr(item.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.total_cyclists}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <a
                    className="text-ameciclo hover:underline"
                    href={`https://api.garfo.ameciclo.org/cyclist-counts/edition/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    JSON
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
          <p>Mostrando {paginatedData.length} de {filteredData.length} linhas ao todo.</p>
          <p>Página {currentPage + 1} de {totalPages}.</p>
          <div className="inline-flex mt-2 xs:mt-0">
            {currentPage > 0 && (
              <button
                className="bg-ameciclo text-white px-4 py-2 rounded mr-2 hover:bg-opacity-80"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <button
                className="bg-ameciclo text-white px-4 py-2 rounded hover:bg-opacity-80"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Próxima
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}