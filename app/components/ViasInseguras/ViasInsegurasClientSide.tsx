import { useState } from "react";
import { AmecicloMap } from "../Commom/Maps/AmecicloMap";
import ConcentrationChart from "./ConcentrationChart";
import ConcentrationByKmChart from "./ConcentrationByKmChart";
import ConcentrationInfoCards from "./ConcentrationInfoCards";
import Table from "../Commom/Table/Table";

interface ViasInsegurasClientSideProps {
  summaryData: any;
  topViasData: {
    dados: Array<{
      top: number;
      sinistros: number;
      sinistros_acum: number;
      km: number;
      km_acum: number;
      sinistros_por_km: number;
      sinistros_por_km_acum: number;
      percentual: number;
      percentual_acum: number;
    }>;
    parametros: {
      intervalo: number;
      periodo: string;
      total_sinistros: number;
      limite: number;
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
  historyData,
}: ViasInsegurasClientSideProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Converter dados das vias para GeoJSON
  const layerData = {
    type: "FeatureCollection" as const,
    features: mapData.vias.map((via) => ({
      type: "Feature" as const,
      properties: {
        id: via.id,
        nome: via.nome,
        sinistros: via.sinistros,
      },
      geometry: via.geometria,
    })),
  };

  // Configuração das camadas do mapa
  const layersConf = [
    {
      id: "vias-inseguras",
      type: "line" as const,
      paint: {
        "line-color": [
          "interpolate",
          ["linear"],
          ["get", "sinistros"],
          0,
          "#FEF3C7",
          50,
          "#F59E0B",
          100,
          "#DC2626",
          200,
          "#7F1D1D",
        ],
        "line-width": [
          "interpolate",
          ["linear"],
          ["get", "sinistros"],
          0,
          2,
          50,
          4,
          100,
          6,
          200,
          8,
        ],
        "line-opacity": 0.8,
      },
    },
  ];

  // Preparar dados para a tabela
  const tableData = topViasData.dados.map((via, index) => ({
    ranking: via.top,
    nome_via: `Via ${via.top}`,
    total_sinistros: via.sinistros.toLocaleString(),
    extensao_km: `${via.km.toFixed(1)} km`,
    densidade: `${via.sinistros_por_km.toFixed(1)}/km`,
    percentual: `${via.percentual.toFixed(2)}%`,
  }));

  const tableColumns = [
    { Header: "Ranking", accessor: "ranking", disableFilters: true },
    { Header: "Nome da Via", accessor: "nome_via", disableFilters: true },
    {
      Header: "Total de Sinistros",
      accessor: "total_sinistros",
      disableFilters: true,
    },
    { Header: "Extensão", accessor: "extensao_km", disableFilters: true },
    { Header: "Densidade", accessor: "densidade", disableFilters: true },
    { Header: "% do Total", accessor: "percentual", disableFilters: true },
  ];

  return (
    <>

      {/* Gráficos de concentração */}
      <section className="container mx-auto my-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Análise de Concentração de Sinistros
          </h2>
          <p className="text-gray-600 max-w-4xl mx-auto">
            Estes gráficos mostram como os sinistros se concentram tanto por ranking das vias
            quanto por extensão, evidenciando a eficiência das intervenções focalizadas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ConcentrationChart data={topViasData.dados} />
          <ConcentrationByKmChart data={topViasData.dados} />
        </div>
      </section>

      {/* InfoCards de concentração */}
      <ConcentrationInfoCards data={topViasData.dados} />

      {/* Mapa das vias inseguras */}
      <section className="container mx-auto my-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Mapa das Vias Inseguras
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Visualização geoespacial das vias com maior concentração de
            sinistros. A cor e espessura das linhas indicam a intensidade dos
            acidentes.
          </p>
        </div>

        {/* Legenda do mapa */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 max-w-2xl mx-auto">
          <h4 className="font-semibold mb-3 text-center">Legenda</h4>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-yellow-200 rounded"></div>
              <span>0-50 sinistros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-yellow-500 rounded"></div>
              <span>50-100 sinistros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-red-600 rounded"></div>
              <span>100-200 sinistros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-red-900 rounded"></div>
              <span>200+ sinistros</span>
            </div>
          </div>
        </div>

        {mapData.vias.length > 0 ? (
          <AmecicloMap layerData={layerData} layersConf={layersConf} />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Mapa não disponível
            </h3>
            <p className="text-gray-500">
              Os dados geoespaciais das vias não estão disponíveis no momento.
            </p>
          </div>
        )}
      </section>

      {/* Análise temporal
      <section className="container mx-auto my-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Evolução Temporal dos Sinistros
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Análise da evolução dos sinistros ao longo do tempo, identificando padrões 
            sazonais, semanais e horários que podem orientar políticas de prevenção.
          </p>
        </div>
        <TemporalAnalysis 
          data={historyData.evolucao}
          selectedVia={historyData.via}
        />
      </section>
 */}
      {/* Tabela de ranking */}
      <section className="container mx-auto my-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ranking das Vias Mais Inseguras
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Lista das vias com maior número de sinistros, incluindo dados de
            densidade por quilômetro para identificar os trechos que necessitam
            intervenção prioritária.
          </p>
        </div>

        <Table
          title="Ranking das Vias Mais Inseguras"
          data={tableData}
          columns={tableColumns}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
      </section>
    </>
  );
}
