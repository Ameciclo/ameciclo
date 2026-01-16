import { useState, useEffect, useMemo } from "react";
import Table from "../Commom/Table/Table";
import { VerticalBarChart } from "../Charts/VerticalBarChart";
import { NumberCards } from "../Commom/NumberCards";
import { SamuChoroplethMap } from "./SamuChoroplethMap";
import { SAMU_CALLS_OUTCOMES, SAMU_CALLS_PROFILES } from "~/servers";

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
  const [selectedCity, setSelectedCity] = useState("RECIFE");
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
    if (!citiesData?.cidades || !selectedCity) return;

    console.log('🔍 Buscando evolução para:', selectedCity);
    console.log('🔍 Cidades disponíveis:', citiesData.cidades.map((c: any) => c.municipio));

    const cityData = citiesData.cidades.find(
      (city: any) => city.municipio === selectedCity
    );

    console.log('🔍 Cidade encontrada:', cityData);
    console.log('🔍 Histórico anual:', cityData?.historico_anual);

    if (!cityData?.historico_anual) {
      console.warn('⚠️ Sem histórico anual para', selectedCity);
      return;
    }

    const chartData = cityData.historico_anual.map((item: any) => ({
      label: item.ano.toString(),
      total: item.total_chamados || item.total || 0,
      atendimento_concluido: item.validos?.atendimento_concluido || 0,
      removido_particulares: item.validos?.removido_particulares || 0,
      removido_bombeiros: item.validos?.removido_bombeiros || 0,
      obito_local: item.validos?.obito_local || 0,
    }));

    console.log('✅ Chart data gerado:', chartData);

    setFilteredEvolutionData({
      data: chartData,
      title: `Evolução das Chamadas SAMU - ${selectedCity}`,
      xAxisTitle: "Ano",
      yAxisTitle: "Número de Chamadas",
    });

    const years = chartData.map((d: any) => parseInt(d.label));
    setAvailableYears(years);
    if (!selectedYear && years.length > 0) {
      setSelectedYear(Math.max(...years)); // Seleciona o ano mais recente
    }
  };

  const getProfileDataFromHistory = async () => {
    if (!selectedYear || !selectedCity) return;

    // Primeiro tentar usar dados do histórico local
    const cityData = citiesData?.cidades?.find(
      (city: any) => city.municipio === selectedCity
    );

    if (cityData?.historico_anual) {
      const yearData = cityData.historico_anual.find(
        (item: any) => item.ano === selectedYear
      );

      if (yearData) {
        if (yearData.por_sexo) {
          const genderTotal = Object.values(yearData.por_sexo).reduce((sum: number, val: any) => sum + val, 0);
          setGenderData(
            Object.entries(yearData.por_sexo).map(([key, value]: [string, any]) => ({
              label: key === "masculino" ? "Masculino" : key === "feminino" ? "Feminino" : "Não Informado",
              value: ((value / genderTotal) * 100).toFixed(1),
              total: value,
              color: key === "masculino" ? "#3b82f6" : key === "feminino" ? "#ec4899" : "#6b7280",
            }))
          );
        }

        if (yearData.por_faixa_etaria) {
          const ageTotal = Object.values(yearData.por_faixa_etaria).reduce((sum: number, val: any) => sum + val, 0);
          setAgeData(
            Object.entries(yearData.por_faixa_etaria)
              .sort(([a], [b]) => {
                const order = ["0_17_anos", "18_29_anos", "30_49_anos", "50_64_anos", "65_mais_anos", "nao_informado"];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([key, value]: [string, any], index) => ({
                label: key.replace(/_/g, " ").replace("nao informado", "Não Informado"),
                value: ((value / ageTotal) * 100).toFixed(1),
                total: value,
                color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626", "#6b7280"][index],
              }))
          );
        }

        if (yearData.por_categoria) {
          const typeTotal = Object.values(yearData.por_categoria).reduce((sum: number, val: any) => sum + val, 0);
          const categoryLabels: Record<string, string> = {
            sinistro_moto: "Sinistro de Moto",
            sinistro_carro: "Sinistro de Carro",
            sinistro_bicicleta: "Sinistro de Bicicleta",
            sinistro_onibus_caminhao: "Sinistro Ônibus/Caminhão",
            atropelamento_carro: "Atropelamento por Carro",
            atropelamento_moto: "Atropelamento por Moto",
            atropelamento_onibus_caminhao: "Atropelamento por Ônibus/Caminhão",
            atropelamento_bicicleta: "Atropelamento por Bicicleta",
            outro: "Outro"
          };
          setTransportData(
            Object.entries(yearData.por_categoria)
              .sort(([, a]: any, [, b]: any) => b - a)
              .map(([key, value]: [string, any], index) => ({
                label: categoryLabels[key] || key,
                value: ((value / typeTotal) * 100).toFixed(1),
                total: value,
                color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#dc2626", "#06b6d4", "#ec4899", "#14b8a6", "#6b7280"][index],
              }))
          );
        }
        return;
      }
    }

    // Se não tiver dados locais, buscar da API
    try {
      const endYear = selectedEndYear || selectedYear;
      const profilesUrl = `${SAMU_CALLS_PROFILES}?city=${encodeURIComponent(selectedCity)}&start_year=${selectedYear}&end_year=${endYear}`;
      const response = await fetch(profilesUrl);
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.by_gender) {
        const genderTotal = Object.values(data.by_gender).reduce((sum: number, val: any) => sum + val, 0);
        setGenderData(
          Object.entries(data.by_gender).map(([key, value]: [string, any]) => ({
            label: key === "M" ? "Masculino" : key === "F" ? "Feminino" : "Não Informado",
            value: ((value as number / genderTotal) * 100).toFixed(1),
            total: value,
            color: key === "M" ? "#3b82f6" : key === "F" ? "#ec4899" : "#6b7280",
          }))
        );
      }

      if (data.by_age_group) {
        const ageTotal = Object.values(data.by_age_group).reduce((sum: number, val: any) => sum + val, 0);
        setAgeData(
          Object.entries(data.by_age_group).map(([key, value]: [string, any], index) => ({
            label: key.replace(/_/g, " "),
            value: ((value as number / ageTotal) * 100).toFixed(1),
            total: value,
            color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626"][index % 5],
          }))
        );
      }

      if (data.by_type) {
        const typeTotal = Object.values(data.by_type).reduce((sum: number, val: any) => sum + val, 0);
        setTransportData(
          Object.entries(data.by_type)
            .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
            .map(([key, value]: [string, any], index) => ({
              label: key,
              value: ((value as number / typeTotal) * 100).toFixed(1),
              total: value,
              color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#dc2626", "#06b6d4"][index % 6],
            }))
        );
      }
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
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
                    setSelectedCity(cityLabel.toUpperCase());
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
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Evolução Anual das Chamadas SAMU
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Distribuição por tipo de desfecho dos atendimentos
              </p>
              
              {/* Legenda */}
              <div className="flex justify-center mb-6 flex-wrap gap-6">
                {[
                  {
                    key: "atendimento_concluido",
                    label: "Atendimento Concluído",
                    color: "#059669",
                  },
                  {
                    key: "removido_particulares",
                    label: "Removido por Particulares",
                    color: "#2563eb",
                  },
                  {
                    key: "removido_bombeiros",
                    label: "Removido pelos Bombeiros",
                    color: "#d97706",
                  },
                  { key: "obito_local", label: "Óbito no Local", color: "#dc2626" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center">
                    <div
                      className="w-4 h-4 mr-2 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <VerticalBarChart
              title=""
              xAxisTitle="Ano"
              yAxisTitle="Número de Chamadas"
              data={filteredEvolutionData.data}
              series={[]}
              xKey="label"
              yKeys={[
                "atendimento_concluido",
                "removido_particulares",
                "removido_bombeiros",
                "obito_local",
              ]}
              colors={["#059669", "#2563eb", "#d97706", "#dc2626"]}
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
              
              {/* Barra de percentual */}
              {genderData && genderData.length > 0 && (
                <div className="flex h-8 mb-3 rounded-md overflow-hidden">
                  {genderData.map((item: any, index) => (
                    <div
                      key={index}
                      className="h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                        minWidth: parseFloat(item.value) > 3 ? "auto" : "0",
                      }}
                      title={`${item.label}: ${item.total?.toLocaleString()} (${item.value}%)`}
                    >
                      {parseFloat(item.value) > 10 ? `${Math.round(parseFloat(item.value))}%` : ""}
                    </div>
                  ))}
                </div>
              )}
              
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
              
              {/* Barra de percentual */}
              {ageData && ageData.length > 0 && (
                <div className="flex h-8 mb-3 rounded-md overflow-hidden">
                  {ageData.map((item: any, index) => (
                    <div
                      key={index}
                      className="h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                        minWidth: parseFloat(item.value) > 3 ? "auto" : "0",
                      }}
                      title={`${item.label}: ${item.total?.toLocaleString()} (${item.value}%)`}
                    >
                      {parseFloat(item.value) > 10 ? `${Math.round(parseFloat(item.value))}%` : ""}
                    </div>
                  ))}
                </div>
              )}
              
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
              
              {/* Barra de percentual */}
              {transportData && transportData.length > 0 && (
                <div className="flex h-8 mb-3 rounded-md overflow-hidden">
                  {transportData.map((item: any, index) => (
                    <div
                      key={index}
                      className="h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                        minWidth: parseFloat(item.value) > 3 ? "auto" : "0",
                      }}
                      title={`${item.label}: ${item.total?.toLocaleString()} (${item.value}%)`}
                    >
                      {parseFloat(item.value) > 10 ? `${Math.round(parseFloat(item.value))}%` : ""}
                    </div>
                  ))}
                </div>
              )}
              
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
