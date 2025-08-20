import { useState, useEffect, useMemo } from "react";
import Table from "../Commom/Table/Table";
import { VerticalBarChart } from "../Charts/VerticalBarChart";
import { NumberCards } from "../Commom/NumberCards";
import { SamuChoroplethMap } from "./SamuChoroplethMap";

interface CityData {
  id?: string | number;
  name?: string;
  municipio_samu?: string;
  count: number;
  rmr?: boolean;
  historico_anual?: Array<{
    ano: number;
    validos?: {
      atendimento_concluido?: number;
      removido_particulares?: number;
      removido_bombeiros?: number;
      obito_local?: number;
    };
    por_sexo?: {
      masculino?: number;
      feminino?: number;
      nao_informado?: number;
    };
    por_faixa_etaria?: Record<string, number>;
    por_categoria?: Record<string, number>;
  }>;
}

interface CitiesData {
  cidades?: CityData[];
  total?: number;
}

interface SamuClientSideProps {
  citiesData: CitiesData;
}

export default function SamuClientSide({ citiesData }: SamuClientSideProps) {
  const [selectedCity, setSelectedCity] = useState("Recife");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedEndYear, setSelectedEndYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [genderData, setGenderData] = useState<any[]>([]);
  const [ageData, setAgeData] = useState<any[]>([]);
  const [transportData, setTransportData] = useState<any[]>([]);
  const [filteredEvolutionData, setFilteredEvolutionData] = useState<any>(null);

  const cityStats = useMemo(() => {
    if (!citiesData?.cidades || !Array.isArray(citiesData.cidades)) return [];

    return citiesData.cidades
      .sort((a, b) => b.count - a.count)
      .map((city, index) => ({
        id: city.id || `cidade-${index}`,
        label: city.name || city.municipio_samu || "N/A",
        value: parseInt(String(city.count)) || 0,
        unit: "chamadas",
        ranking: index + 1,
      }));
  }, [citiesData?.cidades]);

  const rmrCityStats = useMemo(() => {
    return cityStats.filter((city) => {
      const cityData = citiesData?.cidades?.find(
        (c) => c.name === city.label || c.municipio_samu === city.label
      );
      return cityData?.rmr === true;
    });
  }, [cityStats, citiesData?.cidades]);

  const getEvolutionDataForCity = () => {
    if (!citiesData?.cidades) return;

    const cityData = citiesData.cidades.find(
      (city) =>
        city.name === selectedCity || city.municipio_samu === selectedCity
    );

    if (cityData?.historico_anual && Array.isArray(cityData.historico_anual)) {
      const years = cityData.historico_anual
        .map((item: any) => item.ano)
        .sort((a: number, b: number) => a - b);
      setAvailableYears(years);
      if (!selectedYear && years.length > 0) {
        setSelectedYear(years[years.length - 1]);
      }

      const chartData = cityData.historico_anual.map((item: any) => ({
        label: item.ano.toString(),
        atendimento_concluido: item.validos?.atendimento_concluido || 0,
        removido_particulares: item.validos?.removido_particulares || 0,
        removido_bombeiros: item.validos?.removido_bombeiros || 0,
        obito_local: item.validos?.obito_local || 0,
        projecao: item.projecao_total_chamados
          ? item.projecao_total_chamados - item.total_chamados
          : 0,
      }));

      setFilteredEvolutionData({
        data: chartData,
        title: `Chamadas por Ano em ${selectedCity}`,
        xAxisTitle: "Ano",
        yAxisTitle: "Número de Chamadas",
      });
    }
  };

  const getProfileDataFromHistory = () => {
    if (!citiesData?.cidades || !selectedYear) return;

    const cityData = citiesData.cidades.find(
      (city) =>
        city.name === selectedCity || city.municipio_samu === selectedCity
    );

    if (cityData?.historico_anual && Array.isArray(cityData.historico_anual)) {
      let yearsToProcess = [selectedYear];
      if (selectedEndYear) {
        yearsToProcess = [];
        const startYear = Math.min(selectedYear, selectedEndYear);
        const endYear = Math.max(selectedYear, selectedEndYear);
        // Debug: anos selecionados
        for (let year = startYear; year <= endYear; year++) {
          yearsToProcess.push(year);
        }
      }

      const aggregatedData = {
        por_sexo: { masculino: 0, feminino: 0, nao_informado: 0 },
        por_faixa_etaria: {} as Record<string, number>,
        por_categoria: {} as Record<string, number>,
      };

      yearsToProcess.forEach((year) => {
        const yearData = cityData.historico_anual?.find(
          (item) => item.ano === year
        );

        if (yearData) {
          // Agregar dados de sexo
          aggregatedData.por_sexo.masculino +=
            yearData.por_sexo?.masculino || 0;
          aggregatedData.por_sexo.feminino += yearData.por_sexo?.feminino || 0;
          aggregatedData.por_sexo.nao_informado +=
            yearData.por_sexo?.nao_informado || 0;

          // Agregar dados de idade
          Object.entries(yearData.por_faixa_etaria || {}).forEach(
            ([key, value]) => {
              const numValue = typeof value === "number" ? value : 0;
              aggregatedData.por_faixa_etaria[key] =
                (aggregatedData.por_faixa_etaria[key] || 0) + numValue;
            }
          );

          // Agregar dados de categoria
          Object.entries(yearData.por_categoria || {}).forEach(
            ([key, value]) => {
              const numValue = typeof value === "number" ? value : 0;
              if (key === "atropelamento_bicicleta") {
                aggregatedData.por_categoria["sinistro_bicicleta"] =
                  (aggregatedData.por_categoria["sinistro_bicicleta"] || 0) +
                  numValue;
              } else if (
                [
                  "atropelamento_carro",
                  "atropelamento_moto",
                  "atropelamento_onibus_caminhao",
                ].includes(key)
              ) {
                aggregatedData.por_categoria["atropelamento_motorizado"] =
                  (aggregatedData.por_categoria["atropelamento_motorizado"] ||
                    0) + numValue;
              } else {
                aggregatedData.por_categoria[key] =
                  (aggregatedData.por_categoria[key] || 0) + numValue;
              }
            }
          );
        }
      });

      // Processar dados de sexo
      const genderTotal =
        aggregatedData.por_sexo.masculino +
        aggregatedData.por_sexo.feminino +
        aggregatedData.por_sexo.nao_informado;
      if (genderTotal > 0) {
        setGenderData([
          {
            label: "Masculino",
            value: (
              (aggregatedData.por_sexo.masculino / genderTotal) *
              100
            ).toFixed(1),
            total: aggregatedData.por_sexo.masculino,
            color: "#3b82f6",
          },
          {
            label: "Feminino",
            value: (
              (aggregatedData.por_sexo.feminino / genderTotal) *
              100
            ).toFixed(1),
            total: aggregatedData.por_sexo.feminino,
            color: "#ec4899",
          },
          {
            label: "Não Informado",
            value: (
              (aggregatedData.por_sexo.nao_informado / genderTotal) *
              100
            ).toFixed(1),
            total: aggregatedData.por_sexo.nao_informado,
            color: "#6b7280",
          },
        ]);
      }

      // Processar dados de idade
      const ageTotal = Object.values(aggregatedData.por_faixa_etaria).reduce(
        (sum, val) => sum + val,
        0
      );
      if (ageTotal > 0) {
        const ageEntries = Object.entries(aggregatedData.por_faixa_etaria);
        setAgeData(
          ageEntries.map(([key, value], index) => ({
            label: key.replace(/_/g, " "),
            value: ((value / ageTotal) * 100).toFixed(1),
            total: value,
            color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626"][
              index % 5
            ],
          }))
        );
      }

      // Processar dados de categoria
      const categoryLabels = {
        sinistro_moto: "Sinistro de Moto",
        sinistro_carro: "Sinistro de Carro",
        atropelamento_motorizado: "Atropelamento por Motorizado",
        sinistro_bicicleta: "Sinistro de Bicicleta",
        sinistro_onibus_caminhao: "Sinistro Ônibus/Caminhão",
        outro: "Outro",
        nao_informado: "Não Informado",
      };

      const categoryTotal = Object.values(aggregatedData.por_categoria).reduce(
        (sum, val) => sum + val,
        0
      );
      if (categoryTotal > 0) {
        const categoryEntries = Object.entries(
          aggregatedData.por_categoria
        ).sort(([, a], [, b]) => b - a);
        setTransportData(
          categoryEntries.map(([key, value], index) => ({
            label: categoryLabels[key as keyof typeof categoryLabels] || key,
            value: ((value / categoryTotal) * 100).toFixed(1),
            total: value,
            color: [
              "#f59e0b",
              "#10b981",
              "#3b82f6",
              "#8b5cf6",
              "#dc2626",
              "#06b6d4",
              "#84cc16",
              "#f97316",
              "#6366f1",
            ][index % 9],
          }))
        );
      }
    }
  };

  useEffect(() => {
    if (selectedCity && selectedYear) {
      getProfileDataFromHistory();
    }
  }, [selectedCity, selectedYear, selectedEndYear, citiesData]);

  useEffect(() => {
    if (selectedCity) {
      getEvolutionDataForCity();
    }
  }, [selectedCity, citiesData]);

  const { totalChamadas, allCitiesTableData } = useMemo(() => {
    const total = cityStats.reduce((sum, c) => sum + c.value, 0);
    const tableData = cityStats.map((city) => ({
      ranking: city.ranking,
      municipio: city.label,
      total_chamadas: city.value.toLocaleString(),
      percentual:
        total > 0 ? ((city.value / total) * 100).toFixed(1) + "%" : "0%",
    }));
    return { totalChamadas: total, allCitiesTableData: tableData };
  }, [cityStats]);

  return (
    <section className="container mx-auto my-12 space-y-12">
      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Mapa de Chamadas do SAMU
        </h2>
        <div className="mb-8">
          <SamuChoroplethMap
            citiesData={
              citiesData?.cidades?.filter(
                (city) => city.name || city.municipio_samu
              ) || []
            }
          />
        </div>
      </div>

      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Ranking das Cidades Perigosas - RMR
        </h2>
        <p className="text-xl text-center mb-8 text-gray-600">
          Selecione uma cidade para ver os gráficos detalhados
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {cityStats.length > 0 ? (
            <div className="mt-6">
              <NumberCards
                cards={rmrCityStats.map((city) => ({
                  id: city.label,
                  label: city.label,
                  value: city.value.toLocaleString(),
                  unit: "chamadas",
                }))}
                data={{
                  title: "",
                  filters: [],
                }}
                selected={selectedCity}
                options={{
                  type: "default",
                  changeFunction: (cityLabel: string) => {
                    setSelectedCity(cityLabel);
                  },
                  onClickFnc: () => {},
                }}
              />
            </div>
          ) : (
            <div>
              <p className="text-red-500 mb-4">
                Nenhum dado de cidade encontrado!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Evolução das Chamadas ao SAMU
          {selectedCity ? ` - ${selectedCity}` : ""}
        </h2>
        {filteredEvolutionData?.data &&
        filteredEvolutionData.data.length > 0 ? (
          <div className="shadow-2xl rounded p-6 pt-4 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Distribuição de Chamadas por Tipo de Desfecho ao Longo dos Anos
            </h3>

            {/* Legenda */}
            <div className="flex justify-center mb-4 flex-wrap gap-4">
              {[
                {
                  key: "atendimento_concluido",
                  label: "Atendimento Concluído",
                  color: "#10b981",
                },
                {
                  key: "removido_particulares",
                  label: "Removido Particulares",
                  color: "#3b82f6",
                },
                {
                  key: "removido_bombeiros",
                  label: "Removido Bombeiros",
                  color: "#f59e0b",
                },
                { key: "obito_local", label: "Óbito Local", color: "#dc2626" },
                { key: "projecao", label: "Projeção", color: "#ac1666" },
              ].map((item) => (
                <div key={item.key} className="flex items-center">
                  <div
                    className="w-4 h-4 mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <VerticalBarChart
              title={`Chamadas por Ano em ${selectedCity}`}
              xAxisTitle="Ano"
              yAxisTitle="Número de Chamadas"
              data={filteredEvolutionData.data}
              series={[]}
              xKey="label"
              yKeys={[
                "projecao",
                "atendimento_concluido",
                "removido_particulares",
                "removido_bombeiros",
                "obito_local",
              ]}
              colors={["#ac1666", "#10b981", "#3b82f6", "#f59e0b", "#dc2626"]}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-500">Carregando dados de evolução...</p>
          </div>
        )}
      </div>

      {selectedCity && (
        <div className="mx-auto container my-12">
          <h2 className="text-3xl font-bold text-center mb-4">
            Perfis das Chamadas - {selectedCity}
          </h2>

          {availableYears.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Período selecionado:{" "}
                {selectedEndYear
                  ? `${selectedYear} a ${selectedEndYear}`
                  : `${selectedYear}`}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      (
                        selectedEndYear
                          ? year >= selectedYear! && year <= selectedEndYear
                          : year === selectedYear
                      )
                        ? "bg-ameciclo text-white border-ameciclo"
                        : "bg-white text-gray-700 border-gray-300 hover:border-ameciclo hover:bg-gray-50"
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
                      } else {
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold mb-4">Perfil de Sexo (%)</h4>
              <div className="space-y-3">
                {genderData && genderData.length > 0 ? (
                  genderData.map((item: any, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="font-bold">
                        {item.total?.toLocaleString()} ({item.value}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Carregando dados...</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold mb-4">Perfil de Idade (%)</h4>
              <div className="space-y-3">
                {ageData && ageData.length > 0 ? (
                  ageData.map((item: any, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="font-bold">
                        {item.total?.toLocaleString()} ({item.value}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Carregando dados...</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold mb-4">Modo de Transporte (%)</h4>
              <div className="space-y-3">
                {transportData && transportData.length > 0 ? (
                  transportData.map((item: any, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="font-bold">
                        {item.total?.toLocaleString()} ({item.value}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Carregando dados...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto container my-2">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Table
            title="Lista completa das cidades"
            data={allCitiesTableData}
            columns={[
              { Header: "Ranking", accessor: "ranking", disableFilters: true },
              {
                Header: "Município",
                accessor: "municipio",
                disableFilters: true,
              },
              {
                Header: "Total de Chamadas",
                accessor: "total_chamadas",
                disableFilters: true,
              },
              {
                Header: "Percentual (%)",
                accessor: "percentual",
                disableFilters: true,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
