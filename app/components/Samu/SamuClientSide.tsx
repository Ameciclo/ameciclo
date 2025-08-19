import { useState, useEffect } from "react";
import Table from "../Commom/Table/Table";
import { VerticalBarChart } from "../Charts/VerticalBarChart";
import { NumberCards } from "../Commom/NumberCards";
import { SamuChoroplethMap } from "./SamuChoroplethMap";
import {
  SAMU_GENDER_PROFILE_DATA,
  SAMU_AGE_PROFILE_DATA,
  SAMU_TRANSPORT_PROFILE_DATA,
} from "~/servers";

interface SamuClientSideProps {
  citiesData: any;
}

export default function SamuClientSide({ citiesData }: SamuClientSideProps) {
  const [selectedCity, setSelectedCity] = useState("Recife");
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [transportData, setTransportData] = useState([]);
  const [filteredEvolutionData, setFilteredEvolutionData] = useState<any>(null);

  const cityStats =
    citiesData?.cidades && Array.isArray(citiesData.cidades)
      ? citiesData.cidades
          .sort((a: any, b: any) => b.count - a.count)
          .map((city: any, index: number) => ({
            id: city.id || `cidade-${index}`,
            label: city.name || city.municipio_samu || "N/A",
            value: parseInt(city.count) || 0,
            unit: "chamadas",
            ranking: index + 1,
          }))
      : [];

  const rmrCityStats = cityStats.filter((city) => {
    const cityData = citiesData?.cidades?.find(
      (c: any) => c.name === city.label || c.municipio_samu === city.label
    );
    return cityData?.rmr === true;
  });

  const getEvolutionDataForCity = () => {
    if (!citiesData?.cidades) return;

    const cityData = citiesData.cidades.find(
      (city: any) =>
        city.name === selectedCity || city.municipio_samu === selectedCity
    );

    if (cityData?.historico_anual && Array.isArray(cityData.historico_anual)) {
      const chartData = cityData.historico_anual.map((item: any) => ({
        label: item.ano.toString(),
        atendimento_concluido: item.validos?.atendimento_concluido || 0,
        removido_particulares: item.validos?.removido_particulares || 0,
        removido_bombeiros: item.validos?.removido_bombeiros || 0,
        obito_local: item.validos?.obito_local || 0,
      }));

      setFilteredEvolutionData({
        data: chartData,
        title: `Chamadas por Ano em ${selectedCity}`,
        xAxisTitle: "Ano",
        yAxisTitle: "Número de Chamadas",
      });
    }
  };



  const fetchGenderData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append("cidade", selectedCity);
      const response = await fetch(`${SAMU_GENDER_PROFILE_DATA}?${params}`);
      const data = await response.json();
      setGenderData(
        data.map((item: any, index: number) => ({
          label: item.sexo,
          value: item.percentual,
          color: ["#3b82f6", "#ec4899"][index % 2],
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar dados de sexo:", error);
      setGenderData([]);
    }
  };

  const fetchAgeData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append("cidade", selectedCity);
      const response = await fetch(`${SAMU_AGE_PROFILE_DATA}?${params}`);
      const data = await response.json();
      setAgeData(
        data.map((item: any, index: number) => ({
          label: item.faixa_etaria,
          value: item.percentual,
          color: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#dc2626"][
            index % 5
          ],
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar dados de idade:", error);
      setAgeData([]);
    }
  };

  const fetchTransportData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append("cidade", selectedCity);
      const response = await fetch(`${SAMU_TRANSPORT_PROFILE_DATA}?${params}`);
      const data = await response.json();
      setTransportData(
        data.map((item: any, index: number) => ({
          label: item.modo_transporte,
          value: item.percentual,
          color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#dc2626"][
            index % 5
          ],
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar dados de transporte:", error);
      setTransportData([]);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchGenderData();
      fetchAgeData();
      fetchTransportData();
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity) {
      getEvolutionDataForCity();
    }
  }, [selectedCity, citiesData]);

  const totalChamadas = cityStats.reduce((sum, c) => sum + c.value, 0);
  const allCitiesTableData = cityStats.map((city) => ({
    ranking: city.ranking,
    municipio: city.label,
    total_chamadas: city.value.toLocaleString(),
    percentual:
      totalChamadas > 0
        ? ((city.value / totalChamadas) * 100).toFixed(1) + "%"
        : "0%",
  }));

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
                (city: any) => city.name || city.municipio_samu
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
            <h3 className="text-lg font-semibold mb-4">Distribuição de Chamadas por Tipo de Desfecho ao Longo dos Anos</h3>
            
            {/* Legenda */}
            <div className="flex justify-center mb-4 flex-wrap gap-4">
              {[
                { key: "atendimento_concluido", label: "Atendimento Concluído", color: "#10b981" },
                { key: "removido_particulares", label: "Removido Particulares", color: "#3b82f6" },
                { key: "removido_bombeiros", label: "Removido Bombeiros", color: "#f59e0b" },
                { key: "obito_local", label: "Óbito Local", color: "#dc2626" }
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
              yKeys={["atendimento_concluido", "removido_particulares", "removido_bombeiros", "obito_local"]}
              colors={["#10b981", "#3b82f6", "#f59e0b", "#dc2626"]}
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
                      <span className="font-bold">{item.value}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Carregando dados...
                  </p>
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
                      <span className="font-bold">{item.value}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Carregando dados...
                  </p>
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
                      <span className="font-bold">{item.value}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Carregando dados...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Lista Completa das Cidades
        </h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Table
            title="Ranking Completo"
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
