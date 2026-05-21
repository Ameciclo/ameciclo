import React, { useState, useEffect } from "react";
import { StatisticsBox } from "../ExecucaoCicloviaria/StatisticsBox";
import { ExplanationBoxes } from "../Dados/ExplanationBoxes";
import { NumberCards } from "../Commom/NumberCards";
import { SelectableInfoCards } from "./SelectableInfoCards";
import StackedBarChart from "../Commom/Charts/StackedBarChart";
import {
  SelectionFilterMenu,
  FilterBaseType,
  FilterDeathLocationType,
} from "./SelectionFilterMenu";

import {
  getGeneralStatistics,
  getCityCardsByYear,
  getModoTransporteCards,
  getPerfilSocioeconomico,
  formatCausasSecundarias,
  modoTransporteLabels,
} from "../../services/SinistrosFatais/configuration";

import { getStackedTransportModeData } from "../../services/SinistrosFatais/stackedChartConfig";
import { CollisionMatrix } from "./CollisionMatrix";
import { CardsSession } from "./CardsSession";
import {
  DATASUS_CITIES_BY_YEAR_DATA,
  DATASUS_FILTROS_DATA,
  DATASUS_MATRIX_DATA,
  DATASUS_CAUSAS_SECUNDARIAS_DATA,
} from "../../servers";
import { DeathLocationType } from "./DeathLocationFilter";
import { CausasSecundarias } from "./CausasSecundarias";
import cidDescriptions from "../../data/CID10CAT.json";


export default function SinistrosFataisClientSide({
  summaryData,
  citiesByYearData: initialCitiesByYearData,
  pageData,
}: any) {
  const [tipoLocal, setTipoLocal] = useState("ocorrencia");
  const [selectedYear, setSelectedYear] = useState(2023); // Ano inicial
  const [selectedEndYear, setSelectedEndYear] = useState<number | null>(null); // Ano final
  const [selectedCity, setSelectedCity] = useState(2611606); // Mostrar Recife por padrão no gráfico
  const [selectedCardCity, setSelectedCardCity] = useState(2611606); // ID do Recife para os cards
  const [citiesByYearData, setCitiesByYearData] = useState(
    initialCitiesByYearData
  );
  const [showAllCities, setShowAllCities] = useState(false);
  const [modoTransporteData, setModoTransporteData] = useState(null);
  const [isLoadingModoTransporte, setIsLoadingModoTransporte] = useState(false);
  const [collisionMatrixData, setCollisionMatrixData] = useState(null);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
  const [causasSecundariasData, setCausasSecundariasData] = useState<any>(null);
  const [isLoadingCausasSecundarias, setIsLoadingCausasSecundarias] = useState(
    false
  );
  const [deathLocation, setDeathLocation] = useState<DeathLocationType>("all"); // Local de ocorrência do óbito

  // Determinar o último ano disponível nos dados apenas na primeira carga
  useEffect(() => {
    if (
      citiesByYearData &&
      citiesByYearData.anos &&
      citiesByYearData.anos.length > 0 &&
      !selectedYear // Apenas se não houver ano selecionado
    ) {
      // Verificar se 2023 está disponível, caso contrário usar o último ano
      if (citiesByYearData.anos.includes(2023)) {
        setSelectedYear(2023);
      } else {
        setSelectedYear(
          citiesByYearData.anos[citiesByYearData.anos.length - 1]
        );
      }
    }
  }, [citiesByYearData, selectedYear]);

  // Buscar dados quando o tipo de local ou local de ocorrência do óbito mudar
  useEffect(() => {
    // Se já temos dados do SSR e os filtros estão nos defaults, não refetch na montagem
    if (initialCitiesByYearData?.cidades?.length > 0 && tipoLocal === "ocorrencia" && deathLocation === "all") {
      setCitiesByYearData(initialCitiesByYearData);
      return;
    }

    const fetchCitiesByYearData = async () => {
      try {
        let url = `${DATASUS_CITIES_BY_YEAR_DATA}?tipoLocal=${tipoLocal}`;

        if (deathLocation !== "all") {
          if (deathLocation === "health") {
            url += `&localOcorrenciaObito=1,2`;
          } else if (deathLocation === "other") {
            url += `&localOcorrenciaObito=3,5,9`;
          } else {
            url += `&localOcorrenciaObito=4`;
          }
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.anos && data.anos.length > 0) {
          setCitiesByYearData(data);
        } else {
          console.error("Erro: dados incompletos do backend");
          setCitiesByYearData(initialCitiesByYearData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados por tipo de local:", error);
      }
    };

    fetchCitiesByYearData();
  }, [tipoLocal, deathLocation]);

  // Buscar dados de modo de transporte quando a cidade, tipo de local, ano ou local de ocorrência do óbito mudar
  useEffect(() => {
    const fetchModoTransporteData = async () => {
      if (!selectedCardCity || !selectedYear) return;

      setIsLoadingModoTransporte(true);
      try {
        const endYear = selectedEndYear || selectedYear;

        let url = `${DATASUS_FILTROS_DATA}?tipoLocal=${tipoLocal}&municipio=${selectedCardCity}&anoInicio=${selectedYear}&anoFim=${endYear}`;

        if (deathLocation !== "all") {
          if (deathLocation === "health") {
            url += `&localOcorrenciaObito=1,2`;
          } else if (deathLocation === "other") {
            url += `&localOcorrenciaObito=3,5,9`;
          } else {
            url += `&localOcorrenciaObito=4`;
          }
        }

        const response = await fetch(url);
        const data = await response.json();

        if (
          data &&
          data.resumo &&
          ((data.resumo.porModoTransporte &&
            Object.keys(data.resumo.porModoTransporte).length > 0) ||
            (data.resumo.porMeioTransporte &&
              Object.keys(data.resumo.porMeioTransporte).length > 0) ||
            (data.resumo.porCID &&
              Object.keys(data.resumo.porCID).length > 0))
        ) {
          setModoTransporteData(data);
        } else {
          setModoTransporteData(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados de modo de transporte:", error);
        setModoTransporteData(null);
      } finally {
        setIsLoadingModoTransporte(false);
      }
    };

    fetchModoTransporteData();
  }, [selectedCardCity, tipoLocal, selectedYear, selectedEndYear, deathLocation]);

  // Estado para o modo de transporte selecionado
  const [selectedModoTransporte, setSelectedModoTransporte] = useState<string | null>(null);

  // Estado para o modo de transporte do seletor
  const [seletorModoTransporte, setSeletorModoTransporte] = useState<string | null>(null);

  // Obter perfil socioeconômico (usando o seletor ou o card selecionado)
  const modoTransporteAtivo = seletorModoTransporte || selectedModoTransporte;

  // Buscar dados das causas secundárias quando a cidade, tipo de local, ano ou local de ocorrência do óbito mudar
  useEffect(() => {
    const fetchCausasSecundariasData = async () => {
      if (!selectedYear) return;

      setIsLoadingCausasSecundarias(true);
      try {
        const endYear = selectedEndYear || selectedYear;

        let url = `${DATASUS_CAUSAS_SECUNDARIAS_DATA}?anoInicio=${selectedYear}&anoFim=${endYear}&tipoLocal=${tipoLocal}`;

        if (selectedCardCity) {
          url += `&municipio=${selectedCardCity}`;
        }

        if (modoTransporteAtivo) {
          url += `&modoTransporte=${modoTransporteAtivo}`;
        }

        if (deathLocation !== "all") {
          if (deathLocation === "health") {
            url += `&localOcorrenciaObito=1,2`;
          } else if (deathLocation === "other") {
            url += `&localOcorrenciaObito=3,5,9`;
          } else {
            url += `&localOcorrenciaObito=4`;
          }
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.causas) {
          setCausasSecundariasData(formatCausasSecundarias(data));
        } else {
          setCausasSecundariasData(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados de causas secundárias:", error);
        setCausasSecundariasData(null);
      } finally {
        setIsLoadingCausasSecundarias(false);
      }
    };

    fetchCausasSecundariasData();
  }, [
    selectedCardCity,
    tipoLocal,
    selectedYear,
    selectedEndYear,
    modoTransporteAtivo,
    deathLocation,
  ]);

  // Buscar dados da matriz de colisão quando a cidade, tipo de local, ano ou local de ocorrência do óbito mudar
  useEffect(() => {
    const fetchCollisionMatrixData = async () => {
      if (!selectedYear) return;

      setIsLoadingMatrix(true);
      try {
        const endYear = selectedEndYear || selectedYear;

        let url = `${DATASUS_MATRIX_DATA}?anoInicio=${selectedYear}&anoFim=${endYear}&tipoLocal=${tipoLocal}`;

        if (selectedCardCity) {
          url += `&municipio=${selectedCardCity}`;
        }

        if (deathLocation !== "all") {
          if (deathLocation === "health") {
            url += `&localOcorrenciaObito=1,2`;
          } else if (deathLocation === "other") {
            url += `&localOcorrenciaObito=3,5,9`;
          } else {
            url += `&localOcorrenciaObito=4`;
          }
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.matrix) {
          setCollisionMatrixData(data);
        } else {
          setCollisionMatrixData(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados da matriz de colisão:", error);
        setCollisionMatrixData(null);
      } finally {
        setIsLoadingMatrix(false);
      }
    };

    fetchCollisionMatrixData();
  }, [selectedCardCity, tipoLocal, selectedYear, selectedEndYear, deathLocation]);

  // Alternar entre local de ocorrência e residência
  const handleTipoLocalChange = (tipo: string): void => {
    setTipoLocal(tipo);
  };

  // Selecionar cidade
  const handleCityChange = (cityId: number): void => {
    setSelectedCity(cityId);
    setSelectedCardCity(cityId);
    setShowAllCities(false);
  };

  // Selecionar ano ou intervalo de anos
  const handleYearChange = (year: number, endYear: number | null = null): void => {
    // Garantir que pelo menos um ano esteja selecionado
    if (year !== null) {
      setSelectedYear(year);
      setSelectedEndYear(endYear);
    }
  };

  // Alternar entre mostrar todas as cidades ou apenas RMR
  const toggleShowAllCities = (): void => {
    setShowAllCities(!showAllCities);
  };

  // Caixas de explicação padrão caso não venham do Strapi
  const defaultExplanationBoxes = [
    {
      title: "O que são esses dados?",
      description:
        "Dados de mortalidade no trânsito extraídos do Sistema de Informações sobre Mortalidade (SIM) do DATASUS, considerando os códigos CID-10 de V01 a V89 (acidentes de transporte terrestre).",
    },
    {
      title: "Local de Ocorrência vs. Residência",
      description:
        "Local de Ocorrência indica onde o sinistro aconteceu, enquanto Local de Residência mostra onde a vítima morava. Essa distinção é importante para análises de políticas públicas e planejamento urbano.",
    },
  ];

  // Obter o nome da cidade selecionada
  const selectedCityName = selectedCardCity
    ? citiesByYearData?.cidades?.find((c: any) => c.id === selectedCardCity)?.nome ||
      "Cidade selecionada"
    : "RMR";

  // Processar dados de modo de transporte
  const modoTransporteProcessado = modoTransporteData
    ? getModoTransporteCards(modoTransporteData)
    : null;
  const perfilSocioeconomico = modoTransporteData
    ? getPerfilSocioeconomico(modoTransporteData, modoTransporteAtivo)
    : null;

  // Função para alternar a seleção do modo d  // Função para alternar a seleção do modo de transporte nos cards
  const handleModoTransporteClick = (codigo: string): void => {
    // Limpar o seletor quando um card é clicado
    setSeletorModoTransporte(null);

    if (selectedModoTransporte === codigo) {
      setSelectedModoTransporte(null); // Desselecionar se já estiver selecionado
    } else {
      setSelectedModoTransporte(codigo); // Selecionar o novo modo
    }
  };

  // Função para mudar o modo de transporte pelo seletor
  const handleSeletorModoTransporteChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const valor = e.target.value;
    // Limpar a seleção do card quando o seletor é usado
    setSelectedModoTransporte(null);
    setSeletorModoTransporte(valor === "todos" ? null : valor);
  };

  // Formatar o texto do período selecionado
  const getPeriodoText = (): string => {
    if (!selectedYear) return "";
    if (!selectedEndYear) return selectedYear.toString();
    return `${selectedYear} a ${selectedEndYear}`;
  };
  
  // Obter texto completo dos filtros para subtítulos
  const getFullFilterText = (): string => {
    const baseType = tipoLocal === "ocorrencia" 
      ? "Local de ocorrência da morte" 
      : "Local de residência da pessoa morta";
    
    const deathLocText = (() => {
      switch(deathLocation) {
        case "all": return "Todos os locais";
        case "health": return "Hospital/Estabelecimento de saúde";
        case "public": return "Via pública";
        case "other": return "Outros locais e ignorados";
        default: return "Todos os locais";
      }
    })();
    
    return `${selectedCityName} - ${getPeriodoText()} - ${baseType} - ${deathLocText}`;
  };

  // Obter texto completo dos filtros para subtítulos sem o ano
  const getFullFilterTextNoYear = (): string => {
    const baseType = tipoLocal === "ocorrencia" 
      ? "Local de ocorrência da morte" 
      : "Local de residência da pessoa morta";
    
    const deathLocText = (() => {
      switch(deathLocation) {
        case "all": return "Todos os locais";
        case "health": return "Hospital/Estabelecimento de saúde";
        case "public": return "Via pública";
        case "other": return "Outros locais e ignorados";
        default: return "Todos os locais";
      }
    })();
    
    return `${selectedCityName} - ${baseType} - ${deathLocText}`;
  };
    
  return (
    <>
      {/* Estatísticas gerais */}
      <StatisticsBox
        title="Mortes no Trânsito"
        subtitle={`Dados do DATASUS - RMR (por ${
          tipoLocal === "ocorrencia"
            ? "Local de ocorrência da morte"
            : "Local de residência da pessoa morta"
        })`}
        boxes={getGeneralStatistics(summaryData, tipoLocal)}
      />

      {/* Caixas de explicação */}
      <ExplanationBoxes
        boxes={
          pageData.explanationBoxes && pageData.explanationBoxes.length > 0
            ? pageData.explanationBoxes
            : defaultExplanationBoxes
        }
      />

      {/* Seletor de ano e cards de cidades */}
      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Mortes por Cidade
        </h2>
        <h3 className="text-xl text-center mb-8">
          {getFullFilterText()}
        </h3>

        {/* Cards de cidades */}
        {!citiesByYearData || !citiesByYearData.cidades || citiesByYearData.cidades.length === 0 ? (
          <div className="container mx-auto gap-8 my-5 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col rounded-sm shadow-2xl h-full mx-3 p-3 bg-white h-42">
                <div className="h-16 bg-gray-200 animate-pulse rounded-sm mb-3"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded-sm mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded-sm w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <NumberCards
            cards={getCityCardsByYear(
              citiesByYearData,
              selectedYear,
              tipoLocal,
              selectedEndYear
            )}
            data={{
              title: "",
              filters: [],
            }}
            selected={selectedCardCity}
            options={{
              type: "default",
              changeFunction: (cityId: any) => {
                setSelectedCardCity(cityId);
                setSelectedCity(cityId);
                setShowAllCities(false);
              },
              onClickFnc: () => {},
            }}
          />
        )}
      </div>

      {/* Gráfico empilhado por modo de transporte */}
      <div className="mx-auto container my-12">
        <h2 className="text-3xl font-bold text-center mb-4">
          Evolução das Mortes no Trânsito
        </h2>
        <h3 className="text-xl text-center mb-8">
          {getFullFilterTextNoYear()}
        </h3>
        
        {(() => {
          const stackedData = getStackedTransportModeData(citiesByYearData, selectedCardCity, tipoLocal);
          
          if (!citiesByYearData || !citiesByYearData.cidades) {
            return (
              <div className="shadow-2xl rounded-sm p-6 pt-4">
                <h3 className="text-lg font-semibold mb-4">Evolução Anual das Mortes no Trânsito</h3>
                <div className="h-96 bg-gray-200 animate-pulse rounded-sm"></div>
              </div>
            );
          }
          
          if (!stackedData.categories.length || !stackedData.series.length) {
            return (
              <div className="shadow-2xl rounded-sm p-6 pt-4 text-center">
                <h3 className="text-lg font-semibold mb-4">Evolução Anual das Mortes no Trânsito</h3>
                <p className="text-gray-600">Dados não disponíveis para os filtros selecionados.</p>
              </div>
            );
          }
          
          return (
            <StackedBarChart
              title="Evolução Anual das Mortes no Trânsito"
              xAxisTitle="Ano"
              yAxisTitle="Número de Mortes"
              categories={stackedData.categories}
              series={stackedData.series}
            />
          );
        })()}
      </div>

      {/* Matriz de Colisão */}
      <CollisionMatrix
        data={collisionMatrixData}
        isLoading={isLoadingMatrix}
        title="Matriz de Colisão"
        subtitle={getFullFilterText()}
      />
  
     <div className="m-8 p-6 bg-gray-50 rounded-lg shadow-lg border">
        {/* Mortes por modo de transporte */}
        {modoTransporteData &&
          modoTransporteProcessado &&
          modoTransporteProcessado.cards.length > 0 && (
            <div className="mx-auto container my-12">
              <h2 className="text-3xl font-bold text-center mb-4">
                Mortes por Modo de Transporte
              </h2>
              <h3 className="text-xl text-center mb-8">
                {getFullFilterText()}
              </h3>

              <SelectableInfoCards
                cards={modoTransporteProcessado.cards}
                selected={selectedModoTransporte}
                options={{
                  changeFunction: handleModoTransporteClick,
                }}
              />

              <div className="text-center text-sm text-gray-600 mt-2">
                Clique em um modo de transporte para ver seu perfil específico
              </div>

              {modoTransporteProcessado.infoNaoIdentificados.texto && (
                <p className="text-center text-gray-600 mt-4">
                  {modoTransporteProcessado.infoNaoIdentificados.texto}
                </p>
              )}

              {/* Perfil socioeconômico */}
              {perfilSocioeconomico && (
                <div className="mt-8 p-6">
                  <h2 className="text-3xl font-bold text-center mb-4">
                    {perfilSocioeconomico.titulo.startsWith("Perfil de ") 
                      ? `Perfil Socioeconômico de ${perfilSocioeconomico.titulo.substring(10)}`
                      : perfilSocioeconomico.titulo}
                  </h2>
                  <h3 className="text-xl text-center mb-8">
                    {getFullFilterText()}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sexo */}
                    {perfilSocioeconomico.sexo.total > 0 && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="text-lg font-semibold mb-3 text-center">
                          Sexo
                        </h4>

                        {/* Gráfico de barras 100% para sexo */}
                        <div className="flex h-8 mb-3 rounded-md overflow-hidden">
                          {perfilSocioeconomico.sexo.grafico.series[0].data.map(
                            (item: any, index: any) => (
                              <div
                                key={item.name}
                                className="h-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: [
                                    "#1f77b4",
                                    "#ff7f0e",
                                    "#2ca02c",
                                  ][index % 3],
                                  minWidth: item.percentage > 3 ? "auto" : "0",
                                }}
                                title={`${item.name}: ${
                                  item.y
                                } (${item.percentage.toFixed(1)}%)`}
                              >
                                {item.percentage > 10
                                  ? `${item.percentage.toFixed(0)}%`
                                  : ""}
                              </div>
                            )
                          )}
                        </div>

                        {/* Legenda */}
                        <div className="grid grid-cols-1 gap-2">
                          {perfilSocioeconomico.sexo.grafico.series[0].data.map(
                            (item: any, index: any) => (
                              <div
                                key={item.name}
                                className="flex items-center"
                              >
                                <div
                                  className="w-4 h-4 mr-2"
                                  style={{
                                    backgroundColor: [
                                      "#1f77b4",
                                      "#ff7f0e",
                                      "#2ca02c",
                                    ][index % 3],
                                  }}
                                ></div>
                                <div className="text-sm flex-1">
                                  {item.name}
                                </div>
                                <div className="text-sm font-semibold">
                                  {item.y} ({item.percentage.toFixed(1)}%)
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Raça/Cor */}
                    {perfilSocioeconomico.racaCor.total > 0 && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="text-lg font-semibold mb-3 text-center">
                          Raça/Cor
                        </h4>

                        {/* Gráfico de barras 100% para raça/cor */}
                        <div className="flex h-8 mb-3 rounded-md overflow-hidden">
                          {perfilSocioeconomico.racaCor.grafico.series[0].data.map(
                            (item: any, index: any) => (
                              <div
                                key={item.name}
                                className="h-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: [
                                    "#1f77b4",
                                    "#ff7f0e",
                                    "#2ca02c",
                                    "#d62728",
                                    "#9467bd",
                                    "#8c564b",
                                  ][index % 6],
                                  minWidth: item.percentage > 3 ? "auto" : "0",
                                }}
                                title={`${item.name}: ${
                                  item.y
                                } (${item.percentage.toFixed(1)}%)`}
                              >
                                {item.percentage > 10
                                  ? `${item.percentage.toFixed(0)}%`
                                  : ""}
                              </div>
                            )
                          )}
                        </div>

                        {/* Legenda */}
                        <div className="grid grid-cols-1 gap-2">
                          {perfilSocioeconomico.racaCor.grafico.series[0].data.map(
                            (item: any, index: any) => (
                              <div
                                key={item.name}
                                className="flex items-center"
                              >
                                <div
                                  className="w-4 h-4 mr-2"
                                  style={{
                                    backgroundColor: [
                                      "#1f77b4",
                                      "#ff7f0e",
                                      "#2ca02c",
                                      "#d62728",
                                      "#9467bd",
                                      "#8c564b",
                                    ][index % 6],
                                  }}
                                ></div>
                                <div className="text-sm flex-1">
                                  {item.name}
                                </div>
                                <div className="text-sm font-semibold">
                                  {item.y} ({item.percentage.toFixed(1)}%)
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Faixa Etária */}
                    {perfilSocioeconomico.faixaEtaria.total > 0 && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="text-lg font-semibold mb-3 text-center">
                          Faixa Etária
                        </h4>

                        {/* Gráfico de barras 100% para faixa etária */}
                        <div className="flex h-8 mb-3 rounded-md overflow-hidden">
                          {perfilSocioeconomico.faixaEtaria.grafico.series[0].data.map(
                            (item: any, index: any) => (
                              <div
                                key={item.name}
                                className="h-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: [
                                    "#1f77b4",
                                    "#aec7e8",
                                    "#ff7f0e",
                                    "#ffbb78",
                                    "#2ca02c",
                                    "#98df8a",
                                    "#d62728",
                                    "#ff9896",
                                    "#9467bd",
                                    "#c5b0d5",
                                    "#8c564b",
                                  ][index % 11],
                                  minWidth: item.percentage > 3 ? "auto" : "0",
                                }}
                                title={`${item.name}: ${
                                  item.y
                                } (${item.percentage.toFixed(1)}%)`}
                              >
                                {item.percentage > 10
                                  ? `${item.percentage.toFixed(0)}%`
                                  : ""}
                              </div>
                            )
                          )}
                        </div>

                        {/* Legenda */}
                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                          {perfilSocioeconomico.faixaEtaria.grafico.series[0].data.map(
                            (item: any, index: any) => (
                              <div
                                key={item.name}
                                className="flex items-center"
                              >
                                <div
                                  className="w-4 h-4 mr-2"
                                  style={{
                                    backgroundColor: [
                                      "#1f77b4",
                                      "#aec7e8",
                                      "#ff7f0e",
                                      "#ffbb78",
                                      "#2ca02c",
                                      "#98df8a",
                                      "#d62728",
                                      "#ff9896",
                                      "#9467bd",
                                      "#c5b0d5",
                                      "#8c564b",
                                    ][index % 11],
                                  }}
                                ></div>
                                <div className="text-sm flex-1">
                                  {item.name}
                                </div>
                                <div className="text-sm font-semibold">
                                  {item.y} ({item.percentage.toFixed(1)}%)
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Causas Secundárias */}
              <CausasSecundarias
                data={causasSecundariasData}
                isLoading={isLoadingCausasSecundarias}
                title={modoTransporteAtivo ? `Causas Secundárias para ${modoTransporteLabels[modoTransporteAtivo] || ""}` : "Causas Secundárias"}
                subtitle={getFullFilterText()}
                cidDescriptions={cidDescriptions}
              />
            </div>
          )}
      </div>
      {/* Seção de Documentos */}
      {pageData.supportFiles && pageData.supportFiles.length > 0 ? (
        <CardsSession
          title="Documentação sobre segurança viária"
          cards={pageData.supportFiles.map((file) => ({
            title: file.title || file.name || "Documento",
            description: file.description || "",
            url: file.url || "#",
            src: file.src || "/icons/document.svg",
            target: "_blank",
          }))}
        />
      ) : (
        <div className="text-center my-8 p-4">
          <p className="text-gray-500">Nenhum documento disponível no momento.</p>
        </div>
      )}

      {/* Menu de filtros fixo na parte inferior */}
      <div className="pb-16">
        {/* Espaço para evitar que o conteúdo fique escondido atrás do menu fixo */}
      </div>
      <SelectionFilterMenu
        baseType={tipoLocal as FilterBaseType}
        onBaseTypeChange={handleTipoLocalChange}
        deathLocation={deathLocation as FilterDeathLocationType}
        onDeathLocationChange={setDeathLocation}
        selectedYear={selectedYear}
        selectedEndYear={selectedEndYear}
        availableYears={citiesByYearData?.anos || []}
        onYearChange={handleYearChange}
        selectedCity={selectedCardCity}
        selectedCityName={selectedCityName}
        citiesList={citiesByYearData?.cidades || []}
        onCityChange={handleCityChange}
      />
    </>
  );
}