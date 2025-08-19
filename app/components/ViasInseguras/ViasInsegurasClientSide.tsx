import React, { useState } from "react";
import Table from "../Commom/Table/Table";

interface Via {
  ranking: number;
  nome: string;
  sinistros: number;
  percentual: number;
  extensao: number;
}

interface ViasInsegurasClientSideProps {
  viasData: {
    vias: Via[];
    totalSinistros: number;
    totalVias: number;
  };
}

export default function ViasInsegurasClientSide({ viasData }: ViasInsegurasClientSideProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedEndYear, setSelectedEndYear] = useState<number | null>(null);
  const availableYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

  return (
    <section className="container mx-auto my-12 space-y-12">
      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Gráfico de Concentração de Sinistros
        </h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-4 text-center">
            Gráfico de percentuais acumulativos mostrando como os sinistros se concentram em poucas vias
          </p>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Gráfico será implementado aqui</span>
          </div>
        </div>
      </div>

      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Mapa das Vias Inseguras
        </h2>
        
        {availableYears.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Período selecionado: {selectedEndYear ? `${selectedYear} a ${selectedEndYear}` : `${selectedYear}`}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {availableYears.map(year => (
                <button 
                  key={year}
                  className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                    (selectedEndYear 
                      ? year >= selectedYear! && year <= selectedEndYear 
                      : year === selectedYear)
                      ? 'bg-ameciclo text-white border-ameciclo' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-ameciclo hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (!selectedYear) {
                      setSelectedYear(year);
                      setSelectedEndYear(null);
                    } else if (selectedEndYear) {
                      setSelectedYear(year);
                      setSelectedEndYear(null);
                    } else if (year === selectedYear) {
                      // Manter seleção
                    } else if (year < selectedYear) {
                      setSelectedYear(year);
                      setSelectedEndYear(selectedYear);
                    }else {
                      setSelectedEndYear(year);
                    }
                  }}
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
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-500">Mapa interativo será implementado aqui</span>
          </div>
        </div>
      </div>

      <div className="mx-auto container my-2">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Table
            title="Ranking das Vias Mais Inseguras"
            data={viasData.vias.map((via) => ({
              ranking: via.ranking,
              nome_via: via.nome,
              total_sinistros: via.sinistros.toLocaleString(),
              percentual: `${via.percentual}%`,
              extensao: `${via.extensao} km`,
            }))}
            columns={[
              { Header: "Ranking", accessor: "ranking", disableFilters: true },
              {
                Header: "Nome da Via",
                accessor: "nome_via",
                disableFilters: true,
              },
              {
                Header: "Total de Sinistros",
                accessor: "total_sinistros",
                disableFilters: true,
              },
              {
                Header: "% do Total",
                accessor: "percentual",
                disableFilters: true,
              },
              {
                Header: "Extensão (km)",
                accessor: "extensao",
                disableFilters: true,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}