import React, { useState, useEffect } from "react";
import ConcentrationChart from "./ConcentrationChart";
import ViasInsegurasMap from "./ViasInsegurasMap";
import TemporalAnalysis from "./TemporalAnalysis";
import ViaSearch from "./ViaSearch";
import ViasRankingTable from "./ViasRankingTable";
import AdvancedFilters from "./AdvancedFilters";
import InsightsPanel from "./InsightsPanel";

interface ViasInsegurasClientSideProps {
  summaryData: any;
  topViasData: {
    dados: Array<{
      top: number;
      sinistros: number;
      km: number;
      sinistros_por_km: number;
      percentual_total: number;
    }>;
    parametros: {
      intervalo: number;
      periodo: string;
      total_sinistros: number;
    };
  };
  mapData: {
    vias: Array<{
      id: number;
      nome: string;
      sinistros: number;
      geometria: {
        type: string;
        coordinates: number[][];
      };
    }>;
  };
  historyData: {
    evolucao: Array<{
      ano: number;
      sinistros: number;
      meses: Record<string, number>;
      dias_semana: Record<string, number>;
      horarios: Record<string, number>;
      dias_com_dados: number;
      dias_com_sinistros: number;
    }>;
    via?: string;
  };
}

export default function ViasInsegurasClientSide({ 
  summaryData, 
  topViasData, 
  mapData, 
  historyData 
}: ViasInsegurasClientSideProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'ranking' | 'temporal' | 'search'>('overview');
  const [selectedVia, setSelectedVia] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState({
    topVias: topViasData,
    mapVias: mapData,
    history: historyData
  });

  // Função para buscar dados filtrados por período
  const fetchFilteredData = async (startYear: number, endYear?: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        anoInicio: startYear.toString(),
        anoFim: (endYear || startYear).toString(),
        limite: '50'
      });

      // Buscar dados filtrados (simulado - substituir por chamadas reais)
      // const [topResponse, mapResponse] = await Promise.all([
      //   fetch(`http://localhost:8080/samu-calls/streets/top?${params}`),
      //   fetch(`http://localhost:8080/samu-calls/streets/map?${params}`)
      // ]);
      
      // Por enquanto, usar dados existentes
      setFilteredData({
        topVias: topViasData,
        mapVias: mapData,
        history: historyData
      });
    } catch (error) {
      console.error('Erro ao buscar dados filtrados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados de uma via específica
  const fetchViaData = async (viaName: string) => {
    if (!viaName) {
      setFilteredData({
        topVias: topViasData,
        mapVias: mapData,
        history: historyData
      });
      return;
    }

    setIsLoading(true);
    try {
      // Buscar histórico da via específica
      // const response = await fetch(
      //   `http://localhost:8080/samu-calls/streets/history?via=${encodeURIComponent(viaName)}`
      // );
      
      // Por enquanto, simular dados filtrados
      const mockViaHistory = {
        evolucao: historyData.evolucao.map(year => ({
          ...year,
          sinistros: Math.floor(year.sinistros * 0.1) // Simular dados da via específica
        })),
        via: viaName
      };

      setFilteredData(prev => ({
        ...prev,
        history: mockViaHistory
      }));
    } catch (error) {
      console.error('Erro ao buscar dados da via:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViaSearch = (query: string) => {
    // Implementar lógica de busca se necessário
  };

  const handleViaSelect = (via: string) => {
    setSelectedVia(via);
    fetchViaData(via);
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'map', label: 'Mapa', icon: '🗺️' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' },
    { id: 'temporal', label: 'Análise Temporal', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'search', label: 'Buscar Via', icon: '🔍' },
    { id: 'filters', label: 'Filtros', icon: '⚙️' },
  ];

  return (
    <section className="container mx-auto my-12 space-y-8">
      {/* Navegação por abas */}
      <div className="bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-ameciclo text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Indicador de carregamento */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Carregando dados...</span>
          </div>
        </div>
      )}

      {/* Via selecionada */}
      {selectedVia && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-green-600">📍</span>
              <div>
                <span className="font-medium text-green-800">Via selecionada: </span>
                <span className="text-green-700">{selectedVia}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedVia("");
                fetchViaData("");
              }}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo das abas */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-center mb-6">
                Concentração de Sinistros
              </h2>
              <ConcentrationChart data={filteredData.topVias.dados} />
            </div>
            
            {/* Resumo estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-ameciclo mb-2">
                  {summaryData.totalSinistros?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-600">Total de Sinistros</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-ameciclo mb-2">
                  {summaryData.totalVias?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-600">Vias Analisadas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-ameciclo mb-2">
                  {summaryData.anoMaisPerigoso?.ano || 'N/A'}
                </div>
                <div className="text-gray-600">Ano Mais Perigoso</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-ameciclo mb-2">
                  {summaryData.viaMaisPerigosa?.total || '0'}
                </div>
                <div className="text-gray-600">Máx. por Via</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-6">
              Mapa das Vias Inseguras
            </h2>
            <ViasInsegurasMap 
              vias={filteredData.mapVias.vias}
              onYearChange={fetchFilteredData}
            />
          </div>
        )}

        {activeTab === 'ranking' && (
          <div>
            <ViasRankingTable
              data={filteredData.topVias.dados}
              totalSinistros={filteredData.topVias.parametros.total_sinistros || summaryData.totalSinistros || 0}
              periodo={filteredData.topVias.parametros.periodo || `${summaryData.periodoInicio} - ${summaryData.periodoFim}`}
              onViaClick={(ranking) => {
                // Implementar seleção de via por ranking
                const via = `Via ${ranking}`;
                setSelectedVia(via);
                fetchViaData(via);
              }}
            />
          </div>
        )}

        {activeTab === 'temporal' && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-6">
              Análise Temporal dos Sinistros
            </h2>
            <TemporalAnalysis 
              data={filteredData.history.evolucao}
              selectedVia={filteredData.history.via}
            />
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-6">
              Insights e Recomendações
            </h2>
            <InsightsPanel
              summaryData={summaryData}
              topViasData={filteredData.topVias}
              historyData={filteredData.history}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-6">
              Buscar Via Específica
            </h2>
            <ViaSearch
              onSearch={handleViaSearch}
              onViaSelect={handleViaSelect}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'filters' && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-6">
              Configurações e Filtros
            </h2>
            <AdvancedFilters
              onFiltersChange={(filters) => {
                // Implementar aplicação dos filtros
                console.log('Filtros aplicados:', filters);
                fetchFilteredData(filters.anoInicio, filters.anoFim);
              }}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </section>
  );
}