import { useState, useEffect } from "react";
import { AmecicloMap } from "../Commom/Maps/AmecicloMap";

interface Via {
  id: number;
  nome: string;
  sinistros: number;
  geometria: {
    type: string;
    coordinates: number[][];
  };
}

interface ViasInsegurasMapProps {
  vias: Via[];
  onYearChange?: (startYear: number, endYear?: number) => void;
}

export default function ViasInsegurasMap({ vias, onYearChange }: ViasInsegurasMapProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedEndYear, setSelectedEndYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const availableYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

  // Converter dados das vias para GeoJSON
  const layerData = {
    type: "FeatureCollection" as const,
    features: vias.map((via) => ({
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
          0, "#FEF3C7", // Amarelo claro para poucos sinistros
          50, "#F59E0B", // Laranja para sinistros médios
          100, "#DC2626", // Vermelho para muitos sinistros
          200, "#7F1D1D", // Vermelho escuro para sinistros críticos
        ],
        "line-width": [
          "interpolate",
          ["linear"],
          ["get", "sinistros"],
          0, 2,
          50, 4,
          100, 6,
          200, 8,
        ],
        "line-opacity": 0.8,
      },
    },
  ];

  const handleYearSelection = async (year: number) => {
    if (!selectedYear) {
      setSelectedYear(year);
      setSelectedEndYear(null);
    } else if (selectedEndYear) {
      setSelectedYear(year);
      setSelectedEndYear(null);
    } else if (year === selectedYear) {
      // Manter seleção atual
      return;
    } else if (year < selectedYear) {
      setSelectedYear(year);
      setSelectedEndYear(selectedYear);
    } else {
      setSelectedEndYear(year);
    }

    // Notificar mudança de ano para componente pai
    if (onYearChange) {
      setIsLoading(true);
      try {
        if (selectedEndYear || year !== selectedYear) {
          const startYear = year < selectedYear ? year : selectedYear;
          const endYear = year > selectedYear ? year : selectedEndYear;
          await onYearChange(startYear, endYear || undefined);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de ano */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">
          Período selecionado: {selectedEndYear ? `${selectedYear} a ${selectedEndYear}` : `${selectedYear}`}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {availableYears.map(year => (
            <button 
              key={year}
              className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                (selectedEndYear 
                  ? year >= selectedYear && year <= selectedEndYear 
                  : year === selectedYear)
                  ? 'bg-ameciclo text-white border-ameciclo' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-ameciclo hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isLoading && handleYearSelection(year)}
              disabled={isLoading}
            >
              {year}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          {selectedEndYear 
            ? "Clique em um ano para iniciar nova seleção" 
            : "Clique em outro ano para selecionar um intervalo"}
        </p>
        {isLoading && (
          <p className="text-sm text-blue-600 mt-2">
            Carregando dados...
          </p>
        )}
      </div>

      {/* Legenda do mapa */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-semibold mb-3">Legenda</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-200 rounded"></div>
            <span>0-50 sinistros</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-500 rounded"></div>
            <span>50-100 sinistros</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-600 rounded"></div>
            <span>100-200 sinistros</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-900 rounded"></div>
            <span>200+ sinistros</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          A espessura da linha também indica a quantidade de sinistros
        </p>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {vias.length > 0 ? (
          <AmecicloMap
            layerData={layerData}
            layersConf={layersConf}
          />
        ) : (
          <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Nenhum dado de mapa disponível</span>
          </div>
        )}
      </div>

      {/* Estatísticas do mapa */}
      {vias.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-ameciclo">{vias.length}</div>
              <div className="text-sm text-gray-600">Vias mapeadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-ameciclo">
                {vias.reduce((sum, via) => sum + via.sinistros, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total de sinistros</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-ameciclo">
                {Math.max(...vias.map(via => via.sinistros))}
              </div>
              <div className="text-sm text-gray-600">Máximo por via</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}