import { useState, useEffect, useMemo } from "react";
import Table from "../Commom/Table/Table";
import { VerticalBarChart } from "../Charts/VerticalBarChart";
import { NumberCards } from "../Commom/NumberCards";
import { SamuChoroplethMap } from "./SamuChoroplethMap";
import { SamuFilterBar } from "./SamuFilterBar";
import { SAMU_CALLS_PROFILES } from "~/servers";

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function safeNormalize(str: string | undefined): string {
  return str ? normalize(str) : "";
}

interface CityData {
  id?: number;
  name?: string;
  display_name?: string;
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
        label: city.display_name || city.name || city.municipio_samu || "N/A",
        municipio_samu: city.municipio_samu,
        value: parseInt(String(city.count)) || 0,
        unit: "chamadas",
        ranking: index + 1,
      }));
  }, [citiesData?.cidades]);

  const rmrCityStats = useMemo(() => {
    return cityStats.filter((city) => {
      const cityData = citiesData?.cidades?.find(
        (c) => safeNormalize(c.municipio_samu) === safeNormalize(city.label)
      );
      return cityData?.rmr === true;
    });
  }, [cityStats, citiesData?.cidades]);

  const getEvolutionDataForCity = () => {
    if (!citiesData?.cidades || !selectedCity) return;

    console.log('🔍 Buscando evolução para:', selectedCity);
    console.log('🔍 Cidades disponíveis:', citiesData.cidades.map((c: any) => c.municipio));

    const cityData = citiesData.cidades.find(
      (city: any) => safeNormalize(city.municipio) === safeNormalize(selectedCity)
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

    const years = chartData.map((d: any) => parseInt(d.label)).filter((y: number) => y >= 2020);
    setAvailableYears(years);
    if (!selectedYear && years.length > 0) {
      setSelectedYear(Math.max(...years)); // Seleciona o ano mais recente
    }
  };

  const getProfileDataFromHistory = async () => {
    if (!selectedYear || !selectedCity) return;

    const startYear = Math.min(selectedYear, selectedEndYear || selectedYear);
    const endYear = Math.max(selectedYear, selectedEndYear || selectedYear);
    const isRange = selectedEndYear && selectedEndYear !== selectedYear;

    if (isRange) {
      try {
        const url = `${SAMU_CALLS_PROFILES}?city=${encodeURIComponent(selectedCity)}&start_year=${startYear}&end_year=${endYear}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();

          if (data.por_sexo) {
            const genderTotal = Object.values(data.por_sexo).reduce((s: number, v: any) => s + v, 0);
            setGenderData(
              Object.entries(data.por_sexo).map(([key, value]: [string, any]) => ({
                label: key === "masculino" ? "Masculino" : key === "feminino" ? "Feminino" : "Não Informado",
                value: ((value / genderTotal) * 100).toFixed(1),
                total: value,
                color: key === "masculino" ? "#3b82f6" : key === "feminino" ? "#ec4899" : "#6b7280",
              }))
            );
          }

          if (data.por_faixa_etaria) {
            const ageTotal = Object.values(data.por_faixa_etaria).reduce((s: number, v: any) => s + v, 0);
            setAgeData(
              Object.entries(data.por_faixa_etaria)
                .sort(([a]: [string, any], [b]: [string, any]) => {
                  const order = ["0_17_anos", "18_29_anos", "30_49_anos", "50_64_anos", "65_mais_anos", "nao_informado"];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([key, value]: [string, any], index: number) => ({
                  label: key.replace(/_/g, " ").replace("nao informado", "Não Informado"),
                  value: ((value / ageTotal) * 100).toFixed(1),
                  total: value,
                  color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626", "#6b7280"][index],
                }))
            );
          }

          if (data.por_categoria) {
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
            const typeTotal = Object.values(data.por_categoria).reduce((s: number, v: any) => s + v, 0);
            setTransportData(
              Object.entries(data.por_categoria)
                .sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))
                .map(([key, value]: [string, any], index: number) => ({
                  label: categoryLabels[key] || key,
                  value: ((value / typeTotal) * 100).toFixed(1),
                  total: value,
                  color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#dc2626", "#06b6d4", "#ec4899", "#14b8a6", "#6b7280"][index],
                }))
            );
          }

          return;
        }
      } catch {
        // API falhou, usar fallback local
      }
    }

    const cityData = citiesData?.cidades?.find(
      (city: any) => safeNormalize(city.municipio) === safeNormalize(selectedCity)
    );

    if (!cityData?.historico_anual) return;

    const yearDataList = cityData.historico_anual.filter(
      (item: any) => item.ano >= startYear && item.ano <= endYear
    );

    if (yearDataList.length === 0) return;

    const sexoAcc: Record<string, number> = {};
    let hasSexo = false;
    for (const item of yearDataList) {
      if (item.por_sexo) {
        hasSexo = true;
        for (const [k, v] of Object.entries(item.por_sexo)) {
          sexoAcc[k] = (sexoAcc[k] || 0) + (v as number);
        }
      }
    }
    if (hasSexo) {
      const genderTotal = Object.values(sexoAcc).reduce((s, v) => s + v, 0);
      setGenderData(
        Object.entries(sexoAcc).map(([key, value]) => ({
          label: key === "masculino" ? "Masculino" : key === "feminino" ? "Feminino" : "Não Informado",
          value: ((value / genderTotal) * 100).toFixed(1),
          total: value,
          color: key === "masculino" ? "#3b82f6" : key === "feminino" ? "#ec4899" : "#6b7280",
        }))
      );
    }

    const ageAcc: Record<string, number> = {};
    let hasAge = false;
    for (const item of yearDataList) {
      if (item.por_faixa_etaria) {
        hasAge = true;
        for (const [k, v] of Object.entries(item.por_faixa_etaria)) {
          ageAcc[k] = (ageAcc[k] || 0) + (v as number);
        }
      }
    }
    if (hasAge) {
      const ageTotal = Object.values(ageAcc).reduce((s, v) => s + v, 0);
      setAgeData(
        Object.entries(ageAcc)
          .sort(([a], [b]) => {
            const order = ["0_17_anos", "18_29_anos", "30_49_anos", "50_64_anos", "65_mais_anos", "nao_informado"];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map(([key, value], index) => ({
            label: key.replace(/_/g, " ").replace("nao informado", "Não Informado"),
            value: ((value / ageTotal) * 100).toFixed(1),
            total: value,
            color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626", "#6b7280"][index],
          }))
      );
    }

    const catAcc: Record<string, number> = {};
    let hasCat = false;
    for (const item of yearDataList) {
      if (item.por_categoria) {
        hasCat = true;
        for (const [k, v] of Object.entries(item.por_categoria)) {
          catAcc[k] = (catAcc[k] || 0) + (v as number);
        }
      }
    }
    if (hasCat) {
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
      const typeTotal = Object.values(catAcc).reduce((s, v) => s + v, 0);
      setTransportData(
        Object.entries(catAcc)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([key, value], index) => ({
            label: categoryLabels[key] || key,
            value: ((value / typeTotal) * 100).toFixed(1),
            total: value,
            color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#dc2626", "#06b6d4", "#ec4899", "#14b8a6", "#6b7280"][index],
          }))
      );
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

  const selectedCityName = useMemo(() => {
    if (!selectedCity || !citiesData?.cidades) return "Nenhuma cidade";
    const match = citiesData.cidades.find(
      (c: any) => safeNormalize(c.municipio_samu) === safeNormalize(selectedCity)
    );
    return match?.display_name || match?.name || match?.municipio_samu || selectedCity;
  }, [selectedCity, citiesData]);

  const getFilterSummary = (): string => {
    const period = selectedEndYear
      ? `${selectedYear} a ${selectedEndYear}`
      : selectedYear
        ? `${selectedYear}`
        : "";
    return period ? `${selectedCityName} - ${period}` : selectedCityName;
  };

  const citiesList = useMemo(() => {
    if (!citiesData?.cidades) return [];
    return citiesData.cidades
      .sort((a: any, b: any) => b.count - a.count)
      .map((c: any) => ({
        id: c.municipio_samu || c.name || "",
        label: c.display_name || c.name || c.municipio_samu || "",
      }))
      .filter((c: any) => c.id);
  }, [citiesData]);

  const handleFilterStartYearChange = (year: number) => {
    if (selectedEndYear && year > selectedEndYear) {
      setSelectedYear(selectedEndYear);
      setSelectedEndYear(year);
    } else {
      setSelectedYear(year);
    }
  };

  const handleFilterEndYearChange = (year: number | null) => {
    if (year === null) {
      setSelectedEndYear(null);
    } else if (year < selectedYear!) {
      setSelectedEndYear(selectedYear);
      setSelectedYear(year);
    } else {
      setSelectedEndYear(year);
    }
  };

  return (
    <section className="container mx-auto my-12 space-y-12 pb-16">
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
        <h3 className="text-xl text-center mb-8 text-gray-600">
          Selecione uma cidade para ver os gráficos detalhados — {getFilterSummary()}
        </h3>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {cityStats.length > 0 ? (
            <div className="mt-6">
              <NumberCards
                cards={rmrCityStats.map((city) => ({
                  id: city.municipio_samu,
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
                  changeFunction: (cityId: string) => {
                    setSelectedCity(cityId);
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
        </h2>
        <h3 className="text-xl text-center mb-8 text-gray-600">
          {getFilterSummary()}
        </h3>
        {filteredEvolutionData?.data &&
        filteredEvolutionData.data.length > 0 ? (
          <div className="shadow-2xl rounded-sm p-6 pt-4 text-center">
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
                      className="w-4 h-4 mr-2 rounded-xs"
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
            Perfis das Chamadas
          </h2>
          <h3 className="text-xl text-center mb-8 text-gray-600">
            {getFilterSummary()}
          </h3>

          {availableYears.length > 0 && (
            <div className="mb-6 text-center">

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
                          className="w-4 h-4 rounded-sm mr-2"
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
                          className="w-4 h-4 rounded-sm mr-2"
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
                          className="w-4 h-4 rounded-sm mr-2"
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

      <SamuFilterBar
        selectedCity={selectedCity}
        selectedCityName={selectedCityName}
        selectedYear={selectedYear}
        selectedEndYear={selectedEndYear}
        availableYears={availableYears}
        citiesList={citiesList}
        onCityChange={(cityId: string) => setSelectedCity(cityId)}
        onStartYearChange={handleFilterStartYearChange}
        onEndYearChange={handleFilterEndYearChange}
      />

    </section>
  );
}
