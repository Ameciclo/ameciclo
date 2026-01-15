import { useEffect, useState } from "react";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";

let Highcharts: any;
let HighchartsReact: any;

function getInicialFilters() {
  return [
    { key: "gender", value: "Masculino", checked: true },
    { key: "gender", value: "Feminino", checked: true },
    { key: "gender", value: "Outro", checked: true },
    { key: "color_race", value: "Amarela", checked: false },
    { key: "color_race", value: "Branca", checked: false },
    { key: "color_race", value: "Indígena", checked: false },
    { key: "color_race", value: "Parda", checked: false },
    { key: "color_race", value: "Preta", checked: false },
  ];
}

function getFiltersKeys() {
  return [
    { key: "gender", title: "Gênero" },
    { key: "color_race", title: "Cor/Raça" },
  ];
}

function getHistogramData(data: any) {
  return {
    title: {
      text: "Quanto tempo você leva?",
    },

    subtitle: {
      text: "Histograma de agrupamento de distâncias em minutos",
    },

    xAxis: [
      {
        title: { text: "" },
        alignTicks: false,
      },
      {
        title: { text: "Distância em minutos" },
        alignTicks: false,
        opposite: false,
      },
    ],

    yAxis: [
      {
        title: { text: "" },
      },
      {
        title: { text: "Quantidade" },
        opposite: false,
      },
    ],

    series: [
      {
        name: "Total",
        type: "histogram",
        xAxis: 1,
        yAxis: 1,
        baseSeries: "s1",
        zIndex: 2,
      },
      {
        name: "",
        type: "scatter",
        data: data,
        visible: false,
        id: "s1",
        marker: {
          radius: 1.5,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };
}




async function fetchWithFilters(filters: any) {
  const PERFIL_DATA = "https://api.perfil.ameciclo.org/v1/cyclist-profile/summary/"

  const res = await fetch(PERFIL_DATA, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(filters.filter((f) => f.checked)),
  });
  const { data } = await res.json();
  return data;
}

function PerfilClientSide({ apiDown }: { apiDown?: boolean }) {
  const [filters, setFilters] = useState(getInicialFilters());
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [dayData, setDayData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [needData, setNeedData] = useState([]);
  const [startData, setStartData] = useState([]);
  const [continueData, setContinueData] = useState([]);
  const [issueData, setIssueData] = useState([]);
  const [collisionData, setCollisionData] = useState([]);
  const [distanceOptions, setDistanceOptions] = useState(getHistogramData([]));

  useEffect(() => {
    const loadHighcharts = async () => {
      if (typeof window !== "undefined") {
        try {
          const HighchartsModule = await import("highcharts");
          const HighchartsReactModule = await import("highcharts-react-official");
          const HighchartsExporting = await import("highcharts/modules/exporting");
          const HighchartsHistogram = await import("highcharts/modules/histogram-bellcurve");
          const HighchartsMore = await import("highcharts/highcharts-more");
          
          Highcharts = HighchartsModule.default;
          HighchartsReact = HighchartsReactModule.default;
          
          if (typeof HighchartsExporting.default === 'function') {
            HighchartsExporting.default(Highcharts);
          }
          if (typeof HighchartsHistogram.default === 'function') {
            HighchartsHistogram.default(Highcharts);
          }
          if (typeof HighchartsMore.default === 'function') {
            HighchartsMore.default(Highcharts);
          }
          
          setChartsLoaded(true);
        } catch (error) {
          console.error('Erro ao carregar Highcharts:', error);
          setChartsLoaded(true);
        }
      }
    };
    
    loadHighcharts();
  }, []);

  useEffect(() => {
    if (apiDown) {
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const data = await fetchWithFilters(getInicialFilters());
        setDayData(data.dayAggregate);
        setYearData(data.yearAggregate);
        setNeedData(data.needAggregate);
        setStartData(data.startAggregate);
        setContinueData(data.continueAggregate);
        setIssueData(data.issueAggregate);
        setCollisionData(data.collisionAggregate);
        setDistanceOptions(() => getHistogramData(data.distances));
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [apiDown]);

  const applyFilters = async () => {
    if (apiDown) return;
    
    try {
      const data: any = await fetchWithFilters(filters);
      setDayData(data.dayAggregate);
      setYearData(data.yearAggregate);
      setNeedData(data.needAggregate);
      setStartData(data.startAggregate);
      setContinueData(data.continueAggregate);
      setIssueData(data.issueAggregate);
      setCollisionData(data.collisionAggregate);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  };

  const clearFilters = () => {
    setFilters((prevState) => {
      return prevState.map((i: any) => {
        return { ...i, checked: false };
      });
    });
  };

  const toggleFilter = (f: any, i: number) => {
    setFilters((prevState) => {
      return prevState.map((item: any) => {
        return item.value === f.value
          ? { ...item, checked: !item.checked }
          : item;
      });
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto my-12">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#6DBFAC] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  const options = [
    {
      title:
        "Quantos dias da semana costuma utilizar a bicicleta como meio de transporte",
      series: dayData,
    },
    {
      title: "Há quanto tempo utiliza a bicicleta como meio de transporte",
      series: yearData,
    },
    {
      title: "O que faria você pedalar mais?",
      series: needData,
    },
    {
      title: "Qual foi a sua motivação para começar?",
      series: startData,
    },
    {
      title: "Qual foi a sua motivação para continuar a pedalar?",
      series: continueData,
    },
    {
      title: "Qual o seu maior problema ao pedalar?",
      series: issueData,
    },
    {
      title: "Já sofreu algum tipo de colisão?",
      series: collisionData,
    },
  ];

  return (
    <>
      <section className="container mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Filtros de Análise</h2>
            <p className="text-gray-600 text-sm">Selecione os critérios para personalizar a visualização dos dados</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {getFiltersKeys().map((key) => (
              <div key={key.key} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">{key.title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filters
                    .filter((f) => f.key === key.key)
                    .map((f, i) => (
                      <ToogleButton
                        key={f.value}
                        value={f.value}
                        checked={f.checked}
                        onChange={() => toggleFilter(f, i)}
                        disabled={apiDown}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => applyFilters()}
              disabled={apiDown}
              className="w-full sm:w-auto bg-ameciclo text-white hover:bg-opacity-90 font-medium px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ameciclo focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() => clearFilters()}
              disabled={apiDown}
              className="w-full sm:w-auto border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 auto-rows-auto gap-10 my-10">
        {options.map((option, index) => (
          option.series.length > 0 ? (
            <HorizontalBarChart key={index} {...option} />
          ) : (
            <div key={index} className="shadow-2xl rounded p-10">
              <h3 className="text-lg font-semibold mb-4">{option.title}</h3>
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-[#6DBFAC] rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-sm">Carregando dados...</p>
              </div>
            </div>
          )
        ))}
        <div className="shadow-2xl rounded p-10 text-center">
          {chartsLoaded && Highcharts && HighchartsReact && distanceOptions.series[1].data.length > 0 ? (
            <HighchartsReact highcharts={Highcharts} options={distanceOptions} />
          ) : (
            <div className="h-96 flex flex-col items-center justify-center">
              {!chartsLoaded ? (
                <>
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-[#6DBFAC] rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 text-sm">Carregando gráfico...</p>
                </>
              ) : distanceOptions.series[1].data.length === 0 ? (
                <>
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-[#6DBFAC] rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 text-sm">Carregando dados...</p>
                </>
              ) : (
                <p className="text-gray-500">Erro ao carregar gráfico</p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default PerfilClientSide;

function ToogleButton({ value, onChange, checked, disabled }: any) {
  return (
    <label className={`cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        className="sr-only"
        type="checkbox"
        onChange={onChange}
        checked={checked}
        disabled={disabled}
      />
      <div
        className={`px-4 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 border ${
          checked 
            ? 'bg-ameciclo text-white border-ameciclo shadow-sm' 
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
        } focus-within:ring-2 focus-within:ring-ameciclo focus-within:ring-opacity-50`}
      >
        {value}
      </div>
    </label>
  );
}
