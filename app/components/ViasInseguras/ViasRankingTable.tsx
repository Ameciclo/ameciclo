import { useState } from "react";
import Table from "../Commom/Table/Table";

interface ViaRanking {
  top: number;
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

  // Processar dados para a tabela
  const tableData = data.map((via) => ({
    ranking: via.top,
    nome_via: `Via ${via.top}`, // Nome seria obtido de outra fonte
    total_sinistros: via.sinistros.toLocaleString(),
    extensao_km: via.km.toFixed(1),
    sinistros_por_km: via.sinistros_por_km.toFixed(1),
    percentual_total: `${via.percentual_total.toFixed(2)}%`,
    densidade_categoria: getDensityCategory(via.sinistros_por_km),
    // Dados brutos para ordenação
    _sinistros: via.sinistros,
    _km: via.km,
    _densidade: via.sinistros_por_km,
    _percentual: via.percentual_total,
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
      disableFilters: true,
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
      Cell: ({ value, row }: any) => (
        <button
          onClick={() => onViaClick?.(row.original.ranking)}
          className="text-left hover:text-ameciclo hover:underline transition-colors"
        >
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            Clique para ver detalhes
          </div>
        </button>
      ),
    },
    {
      Header: "Total de Sinistros",
      accessor: "total_sinistros",
      disableFilters: true,
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
      accessor: "extensao_km",
      disableFilters: true,
      Cell: ({ value }: any) => (
        <div className="text-right">
          <span className="font-mono">{value} km</span>
        </div>
      ),
    },
    {
      Header: "Densidade",
      accessor: "sinistros_por_km",
      disableFilters: true,
      Cell: ({ value, row }: any) => (
        <div className="text-right">
          <div className="font-semibold">{value}/km</div>
          <span className={`
            inline-block px-2 py-1 rounded-full text-xs font-medium
            ${getDensityColor(row.original.densidade_categoria)}
          `}>
            {row.original.densidade_categoria}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ranking das Vias Mais Inseguras</h3>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold text-ameciclo">
                {totalSinistros.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total de sinistros</div>
            </div>
          </div>
        </div>

        {/* Legenda de densidade */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 mr-2">Densidade:</span>
          {[
            { label: "Crítica", color: "text-red-700 bg-red-100" },
            { label: "Alta", color: "text-orange-700 bg-orange-100" },
            { label: "Média", color: "text-yellow-700 bg-yellow-100" },
            { label: "Baixa", color: "text-blue-700 bg-blue-100" },
            { label: "Muito Baixa", color: "text-gray-700 bg-gray-100" },
          ].map(({ label, color }) => (
            <span
              key={label}
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${color}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {data.length > 0 ? (
          <Table
            title=""
            data={tableData}
            columns={columns}
            showFilters={false}
          />
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
            <p className="text-gray-500">Os dados do ranking das vias não estão disponíveis no momento.</p>
          </div>
        )}
      </div>

      {/* Insights */}
      {data.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">Análise do Ranking</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="mb-2">
                <strong>Top 10 vias</strong> concentram{" "}
                <span className="font-semibold">
                  {data.slice(0, 10).reduce((sum, via) => sum + via.percentual_total, 0).toFixed(1)}%
                </span>{" "}
                de todos os sinistros.
              </p>
              <p>
                <strong>Via mais perigosa</strong> tem densidade de{" "}
                <span className="font-semibold">
                  {data[0]?.sinistros_por_km.toFixed(1)} sinistros/km
                </span>.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Densidade média</strong> das top 10:{" "}
                <span className="font-semibold">
                  {(data.slice(0, 10).reduce((sum, via) => sum + via.sinistros_por_km, 0) / 10).toFixed(1)} sinistros/km
                </span>.
              </p>
              <p>
                <strong>Extensão total</strong> analisada:{" "}
                <span className="font-semibold">
                  {data.reduce((sum, via) => sum + via.km, 0).toFixed(1)} km
                </span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}