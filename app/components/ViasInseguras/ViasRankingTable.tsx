import { useState } from "react";
import { Link } from "@remix-run/react";
import Table from "../Commom/Table/Table";
import { slugify } from "~/utils/slugify";

interface ViaRanking {
  top: number;
  nome?: string;
  sinistros: number;
  km: number;
  sinistros_por_km: number;
  percentual_total: number;
}

interface ViasRankingTableProps {
  data: ViaRanking[];
  totalSinistros: number;
  periodo: string;
  onViaClick?: (ranking: number) => void;
}

export default function ViasRankingTable({ 
  data, 
  totalSinistros, 
  periodo, 
  onViaClick 
}: ViasRankingTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ViaRanking;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [densityFilter, setDensityFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Processar dados para a tabela
  const tableData = (data || [])
    .filter((via) => {
      if (!densityFilter) return true;
      return getDensityCategory(via.sinistros_por_km || 0) === densityFilter;
    })
    .map((via) => ({
      ranking: via.top || 0,
      nome_via: via.nome || `Via ${via.top || 0}`,
      slug: via.nome ? slugify(via.nome) : `via-${via.top || 0}`,
      total_sinistros: (via.sinistros || 0).toLocaleString(),
      extensao_km: (via.km || 0).toFixed(1),
      sinistros_por_km: (via.sinistros_por_km || 0).toFixed(1),
      percentual_total: `${(via.percentual_total || 0).toFixed(2)}%`,
      densidade_categoria: getDensityCategory(via.sinistros_por_km || 0),
      // Dados brutos para ordenação
      _sinistros: via.sinistros || 0,
      _km: via.km || 0,
      _densidade: via.sinistros_por_km || 0,
      _percentual: via.percentual_total || 0,
    }));

  function getDensityCategory(density: number): string {
    if (density >= 20) return "Crítica";
    if (density >= 15) return "Alta";
    if (density >= 10) return "Média";
    if (density >= 5) return "Baixa";
    return "Muito Baixa";
  }

  function getDensityColor(category: string): string {
    switch (category) {
      case "Crítica": return "text-red-700 bg-red-100";
      case "Alta": return "text-orange-700 bg-orange-100";
      case "Média": return "text-yellow-700 bg-yellow-100";
      case "Baixa": return "text-blue-700 bg-blue-100";
      default: return "text-gray-700 bg-gray-100";
    }
  }

  const columns = [
    {
      Header: "Ranking",
      accessor: "ranking",
      disableFilters: false,
      Filter: ({ column: { filterValue, setFilter, id } }: any) => {
        const inputId = `ranking-filter-${id}`;
        return (
          <>
            <label htmlFor={inputId} className="sr-only">Buscar ranking</label>
            <input
              id={inputId}
              value={filterValue || ''}
              onChange={e => setFilter(e.target.value || undefined)}
              placeholder="Buscar ranking"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label="Buscar ranking"
            />
          </>
        );
      },
      Cell: ({ value, row }: any) => (
        <div className="flex items-center gap-2">
          <span className={`
            inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
            ${value <= 3 ? 'bg-red-100 text-red-800' : 
              value <= 10 ? 'bg-orange-100 text-orange-800' : 
              'bg-gray-100 text-gray-800'}
          `}>
            {value}
          </span>
          {value <= 3 && (
            <span className="text-lg">
              {value === 1 ? '🥇' : value === 2 ? '🥈' : '🥉'}
            </span>
          )}
        </div>
      ),
    },
    {
      Header: "Nome da Via",
      accessor: "nome_via",
      disableFilters: false,
      Cell: ({ value, row }: any) => (
        <Link
          to={`/dados/vias-inseguras/${row.original.slug}`}
          className="text-left hover:text-ameciclo hover:underline transition-colors block"
        >
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            Clique para ver detalhes
          </div>
        </Link>
      ),
    },
    {
      Header: "Total de Sinistros",
      accessor: "_sinistros",
      disableFilters: false,
      Filter: ({ column: { filterValue = [], setFilter, id } }: any) => {
        const [min, max] = filterValue;
        const minId = `sinistros-min-${id}`;
        const maxId = `sinistros-max-${id}`;
        return (
          <div className="flex space-x-2">
            <label htmlFor={minId} className="sr-only">Sinistros mínimo</label>
            <input
              id={minId}
              value={min || ''}
              type="number"
              onChange={e => {
                const val = e.target.value;
                setFilter((old = []) => [val ? Number(val) : undefined, old[1]]);
              }}
              placeholder="Mín"
              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
              aria-label="Sinistros mínimo"
            />
            <label htmlFor={maxId} className="sr-only">Sinistros máximo</label>
            <input
              id={maxId}
              value={max || ''}
              type="number"
              onChange={e => {
                const val = e.target.value;
                setFilter((old = []) => [old[0], val ? Number(val) : undefined]);
              }}
              placeholder="Máx"
              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
              aria-label="Sinistros máximo"
            />
          </div>
        );
      },
      filter: 'numberRange',
      Cell: ({ value, row }: any) => (
        <div className="text-right">
          <div className="font-semibold text-lg">{value}</div>
          <div className="text-sm text-gray-500">
            {row.original.percentual_total} do total
          </div>
        </div>
      ),
    },
    {
      Header: "Extensão (km)",
      accessor: "_km",
      disableFilters: false,
      Filter: ({ column: { filterValue = [], setFilter, id } }: any) => {
        const [min, max] = filterValue;
        const minId = `km-min-${id}`;
        const maxId = `km-max-${id}`;
        return (
          <div className="flex space-x-2">
            <label htmlFor={minId} className="sr-only">Extensão mínima em km</label>
            <input
              id={minId}
              value={min || ''}
              type="number"
              step="0.1"
              onChange={e => {
                const val = e.target.value;
                setFilter((old = []) => [val ? Number(val) : undefined, old[1]]);
              }}
              placeholder="Mín km"
              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
              aria-label="Extensão mínima em km"
            />
            <label htmlFor={maxId} className="sr-only">Extensão máxima em km</label>
            <input
              id={maxId}
              value={max || ''}
              type="number"
              step="0.1"
              onChange={e => {
                const val = e.target.value;
                setFilter((old = []) => [old[0], val ? Number(val) : undefined]);
              }}
              placeholder="Máx km"
              className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
              aria-label="Extensão máxima em km"
            />
          </div>
        );
      },
      filter: 'numberRange',
      Cell: ({ row }: any) => (
        <div className="text-right">
          <span className="font-mono">{row.original.extensao_km}</span>
        </div>
      ),
    },
    {
      Header: "Vítimas/km",
      accessor: "densidade_categoria",
      disableFilters: false,
      Cell: ({ value, row }: any) => (
        <div className="text-right">
          {row.original._km >= 1 ? (
            <>
              <div className="font-semibold">{row.original.sinistros_por_km}</div>
              <span className={`
                inline-block px-2 py-1 rounded-full text-xs font-medium
                ${getDensityColor(value)}
              `}>
                {value}
              </span>
            </>
          ) : (
            <div className="text-gray-400 text-sm">-</div>
          )}
        </div>
      ),
    },
  ];

  const customHeader = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-600">Ranking das Vias Mais Inseguras</h3>
      </div>
      
      <div className="mt-4 md:mt-0">
        <div className="text-right">
          <div className="text-2xl font-bold text-ameciclo">
            {(totalSinistros || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total de sinistros</div>
        </div>
      </div>
    </div>
  );

  const densityLegend = (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700 mr-2">Densidade:</span>
      {[
        { label: "Crítica", color: "text-red-700 bg-red-100" },
        { label: "Alta", color: "text-orange-700 bg-orange-100" },
        { label: "Média", color: "text-yellow-700 bg-yellow-100" },
        { label: "Baixa", color: "text-blue-700 bg-blue-100" },
        { label: "Muito Baixa", color: "text-gray-700 bg-gray-100" },
      ].map(({ label, color }) => (
        <button
          key={label}
          onClick={() => setDensityFilter(densityFilter === label ? null : label)}
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 cursor-pointer ${
            densityFilter === label 
              ? `${color} ring-2 ring-offset-1 ring-gray-400` 
              : color
          }`}
        >
          {label}
        </button>
      ))}
      {densityFilter && (
        <button
          onClick={() => setDensityFilter(null)}
          className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Limpar filtro
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {(data || []).length > 0 ? (
        <>
          <Table
            title=""
            data={tableData}
            columns={columns}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            customHeader={
              <>
                {customHeader}
                {densityLegend}
              </>
            }
          />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            {customHeader}
            {densityLegend}
          </div>
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-500">Os dados do ranking das vias não estão disponíveis no momento.</p>
            </div>
          </div>
        )}
      )

      {/* Insights */}
      {(data || []).length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">Análise do Ranking</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="mb-2">
                <strong>Top 10 vias</strong> concentram{" "}
                <span className="font-semibold">
                  {(data || []).slice(0, 10).reduce((sum, via) => sum + via.percentual_total, 0).toFixed(1)}%
                </span>{" "}
                de todos os sinistros.
              </p>
              <p>
                <strong>Via mais perigosa</strong> tem densidade de{" "}
                <span className="font-semibold">
                  {((data || [])[0]?.sinistros_por_km || 0).toFixed(1)} sinistros/km
                </span>.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Densidade média</strong> das top 10:{" "}
                <span className="font-semibold">
                  {((data || []).slice(0, 10).reduce((sum, via) => sum + (via.sinistros_por_km || 0), 0) / Math.max(1, (data || []).slice(0, 10).length)).toFixed(1)} sinistros/km
                </span>.
              </p>
              <p>
                <strong>Extensão total</strong> analisada:{" "}
                <span className="font-semibold">
                  {(data || []).reduce((sum, via) => sum + (via.km || 0), 0).toFixed(1)} km
                </span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}