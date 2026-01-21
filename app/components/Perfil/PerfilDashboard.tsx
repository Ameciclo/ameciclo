import { useEffect, useState, useRef } from "react";
import { Users, User, UserCircle, Filter, FileText, Download } from "lucide-react";
import HorizontalBarChart from "~/components/Commom/Charts/HorizontalBarChart";

let Highcharts: any;
let HighchartsReact: any;

function getInicialFilters() {
  return [
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

function getHistogramData(dataByColorRace: any) {
  const colorRaces = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'];
  const series: any[] = [];
  let seriesIndex = 1;

  colorRaces.forEach(colorRace => {
    const data = dataByColorRace[colorRace] || [];
    const filteredData = data.filter((d: number) => d <= 150);
    
    if (filteredData.length > 0) {
      series.push(
        {
          name: colorRace,
          type: "histogram",
          xAxis: 1,
          yAxis: 1,
          baseSeries: `s${seriesIndex}`,
          color: COLOR_RACE_COLORS[colorRace],
          zIndex: 2,
        },
        {
          name: "",
          type: "scatter",
          data: filteredData,
          visible: false,
          id: `s${seriesIndex}`,
          marker: {
            radius: 1.5,
          },
        }
      );
      seriesIndex++;
    }
  });
  
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
        max: 150,
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

    series: series,
    credits: {
      enabled: false,
    },
  };
}




function aggregateProfileData(rawData: any[], filters: any[], genderFilter?: string) {
  console.log('Starting aggregation with', rawData?.length, 'items');
  
  // Filtrar dados baseado nos filtros selecionados
  let filteredData = rawData || [];
  
  const activeFilters = filters.filter(f => f.checked);
  console.log('Active filters:', activeFilters.length);
  
  if (activeFilters.length > 0) {
    filteredData = rawData.filter(item => {
      return activeFilters.some(filter => {
        if (filter.key === 'gender') {
          return item.data?.gender === filter.value;
        }
        if (filter.key === 'color_race') {
          return item.data?.color_race === filter.value;
        }
        return true;
      });
    });
  }
  
  // Aplicar filtro de gênero adicional se especificado
  if (genderFilter && genderFilter !== 'all') {
    filteredData = filteredData.filter(item => item.data?.gender === genderFilter);
  }
  
  console.log('Filtered data:', filteredData.length, 'items');

  // Agregar por dias da semana separado por cor/raça
  const dayAggregate = aggregateByFieldWithColorRace(filteredData, 'days_usage.total', [
    { label: '1 dia', min: 1, max: 1 },
    { label: '2 dias', min: 2, max: 2 },
    { label: '3 dias', min: 3, max: 3 },
    { label: '4 dias', min: 4, max: 4 },
    { label: '5 dias', min: 5, max: 5 },
    { label: '6 dias', min: 6, max: 6 },
    { label: '7 dias', min: 7, max: 7 },
  ]);

  // Agregar por anos usando separado por cor/raça
  const yearAggregate = aggregateByStringFieldWithColorRace(filteredData, 'years_using');

  // Agregar por necessidades separado por cor/raça
  const needAggregate = aggregateByStringFieldWithColorRace(filteredData, 'frequency_what');

  // Agregar por motivação inicial separado por cor/raça
  const startAggregate = aggregateByStringFieldWithColorRace(filteredData, 'motivation_to_start');

  // Agregar por motivação para continuar separado por cor/raça
  const continueAggregate = aggregateByStringFieldWithColorRace(filteredData, 'motivation_to_continue');

  // Agregar por problemas separado por cor/raça
  const issueAggregate = aggregateByStringFieldWithColorRace(filteredData, 'biggest_issue');

  // Agregar por colisões separado por cor/raça
  const collisionAggregate = aggregateByStringFieldWithColorRace(filteredData, 'collisions');

  // Agregar por faixa etária separado por cor/raça
  const ageAggregate = aggregateByStringFieldWithColorRace(filteredData, 'age_category');

  // Agregar por escolaridade separado por cor/raça
  const schoolingAggregate = aggregateByStringFieldWithColorRace(filteredData, 'schooling');

  // Agregar por faixa salarial separado por cor/raça
  const incomeAggregate = aggregateByStringFieldWithColorRace(filteredData, 'income_original');

  // Agregar por dias de uso para trabalho separado por cor/raça
  const workDaysAggregate = aggregateByFieldWithColorRace(filteredData, 'days_usage.working', [
    { label: '0 dias', min: 0, max: 0 },
    { label: '1 dia', min: 1, max: 1 },
    { label: '2 dias', min: 2, max: 2 },
    { label: '3 dias', min: 3, max: 3 },
    { label: '4 dias', min: 4, max: 4 },
    { label: '5 dias', min: 5, max: 5 },
    { label: '6 dias', min: 6, max: 6 },
    { label: '7 dias', min: 7, max: 7 },
  ]);

  // Agregar por dias de uso para lazer separado por cor/raça
  const leisureDaysAggregate = aggregateByFieldWithColorRace(filteredData, 'days_usage.leisure', [
    { label: '0 dias', min: 0, max: 0 },
    { label: '1 dia', min: 1, max: 1 },
    { label: '2 dias', min: 2, max: 2 },
    { label: '3 dias', min: 3, max: 3 },
    { label: '4 dias', min: 4, max: 4 },
    { label: '5 dias', min: 5, max: 5 },
    { label: '6 dias', min: 6, max: 6 },
    { label: '7 dias', min: 7, max: 7 },
  ]);

  // Agregar por combinação com transporte separado por cor/raça
  const transportCombinationAggregate = aggregateByStringFieldWithColorRace(filteredData, 'transport_combination.yes_no');

  // Distâncias separadas por cor/raça
  const distancesByColorRace: any = {};
  const colorRaces = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'];
  
  colorRaces.forEach(colorRace => {
    distancesByColorRace[colorRace] = filteredData
      .filter(item => item.data?.color_race === colorRace)
      .map(item => item.data?.distance_time)
      .filter(d => d && !isNaN(d));
  });

  const result = {
    dayAggregate,
    yearAggregate,
    needAggregate,
    startAggregate,
    continueAggregate,
    issueAggregate,
    collisionAggregate,
    ageAggregate,
    schoolingAggregate,
    incomeAggregate,
    workDaysAggregate,
    leisureDaysAggregate,
    transportCombinationAggregate,
    distancesByColorRace
  };
  
  console.log('Aggregation result:', {
    dayAggregate: dayAggregate.length,
    yearAggregate: yearAggregate.length,
    needAggregate: needAggregate.length,
    startAggregate: startAggregate.length,
    continueAggregate: continueAggregate.length,
    issueAggregate: issueAggregate.length,
    collisionAggregate: collisionAggregate.length,
    distancesByColorRace: Object.keys(distancesByColorRace).length
  });

  return result;
}

const COLOR_RACE_COLORS: any = {
  'Amarela': '#FFD700',
  'Branca': '#B0B0B0',
  'Indígena': '#8B4513',
  'Parda': '#D2691E',
  'Preta': '#2C2C2C'
};

function aggregateByFieldWithColorRace(data: any[], field: string, ranges: any[]) {
  const colorRaces = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'];
  const series: any[] = [];

  colorRaces.forEach(colorRace => {
    const filteredData = data.filter(item => item.data?.color_race === colorRace);
    const counts: any = {};
    ranges.forEach(r => counts[r.label] = 0);

    filteredData.forEach(item => {
      const value = getNestedValue(item.data, field);
      if (value !== undefined && value !== null) {
        const range = ranges.find(r => value >= r.min && value <= r.max);
        if (range) counts[range.label]++;
      }
    });

    const seriesData = Object.entries(counts).map(([name, y]) => ({ name, y }));
    if (seriesData.some(d => d.y > 0)) {
      series.push({
        name: colorRace,
        data: seriesData,
        color: COLOR_RACE_COLORS[colorRace]
      });
    }
  });

  return series;
}

function aggregateByStringFieldWithColorRace(data: any[], field: string) {
  const colorRaces = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'];
  
  // Primeiro, obter todas as categorias únicas
  const allCategories = new Set<string>();
  data.forEach(item => {
    const value = getNestedValue(item.data, field);
    if (value && value !== '' && value !== ' ' && value !== 'null' && value !== 'undefined') {
      // Transformar valores booleanos para labels descritivas
      let displayValue = String(value);
      if (field === 'transport_combination.yes_no') {
        if (value === true || value === 'true' || value === 'True') {
          displayValue = 'Utiliza bicicleta combinada com outro transporte';
        } else if (value === false || value === 'false' || value === 'False') {
          displayValue = 'Não utiliza combinação';
        }
      }
      allCategories.add(displayValue);
    }
  });
  
  if (allCategories.size === 0) {
    console.log(`No data found for field: ${field}`);
    return [];
  }

  // Contar por categoria e cor/raça
  const categoryCounts: any = {};
  allCategories.forEach(cat => {
    categoryCounts[cat] = { total: 0 };
  });

  data.forEach(item => {
    const value = getNestedValue(item.data, field);
    let displayValue = String(value);
    
    // Transformar valores booleanos para labels descritivas
    if (field === 'transport_combination.yes_no') {
      if (value === true || value === 'true' || value === 'True') {
        displayValue = 'Utiliza bicicleta combinada com outro transporte';
      } else if (value === false || value === 'false' || value === 'False') {
        displayValue = 'Não utiliza combinação';
      }
    }
    
    if (value && value !== '' && value !== ' ' && value !== 'null' && value !== 'undefined') {
      if (categoryCounts[displayValue]) {
        categoryCounts[displayValue].total++;
      }
    }
  });

  // Pegar top 10 categorias
  const topCategories = Object.entries(categoryCounts)
    .sort((a: any, b: any) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([name]) => name);

  // Criar séries por cor/raça
  const series: any[] = [];
  colorRaces.forEach(colorRace => {
    const filteredData = data.filter(item => item.data?.color_race === colorRace);
    const counts: any = {};
    
    filteredData.forEach(item => {
      const value = getNestedValue(item.data, field);
      let displayValue = String(value);
      
      // Transformar valores booleanos para labels descritivas
      if (field === 'transport_combination.yes_no') {
        if (value === true || value === 'true' || value === 'True') {
          displayValue = 'Utiliza bicicleta combinada com outro transporte';
        } else if (value === false || value === 'false' || value === 'False') {
          displayValue = 'Não utiliza combinação';
        }
      }
      
      if (value && value !== '' && value !== ' ' && value !== 'null' && value !== 'undefined' && topCategories.includes(displayValue)) {
        counts[displayValue] = (counts[displayValue] || 0) + 1;
      }
    });

    const seriesData = topCategories.map(cat => ({
      name: cat,
      y: counts[cat] || 0
    }));

    if (seriesData.some(d => d.y > 0)) {
      series.push({
        name: colorRace,
        data: seriesData,
        color: COLOR_RACE_COLORS[colorRace]
      });
    }
  });

  return series;
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function HistogramWithGenderFilter({ distanceOptions, profileData, filters, globalGenderFilter, chartsLoaded, Highcharts, HighchartsReact }: any) {
  const [genderFilter, setGenderFilter] = useState('all');
  const [chartOptions, setChartOptions] = useState(distanceOptions);

  useEffect(() => {
    setGenderFilter(globalGenderFilter);
    const data = aggregateProfileData(profileData, filters, globalGenderFilter);
    const histogram = getHistogramData(data.distancesByColorRace || {});
    setChartOptions(histogram);
  }, [globalGenderFilter, filters, profileData]);

  const updateChartData = (gender: string) => {
    setGenderFilter(gender);
    const data = aggregateProfileData(profileData, filters, gender);
    const histogram = getHistogramData(data.distancesByColorRace || {});
    setChartOptions(histogram);
  };

  const getLabel = () => {
    if (genderFilter === 'Masculino') return 'Masculino';
    if (genderFilter === 'Feminino') return 'Feminino';
    return 'Todos';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {chartsLoaded && Highcharts && HighchartsReact && chartOptions.series.length > 0 ? (
        <>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">{getLabel()}</span>
            <div className="flex gap-1 border border-gray-300 rounded p-1">
              <button
                onClick={() => updateChartData('all')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  genderFilter === 'all'
                    ? 'bg-gray-200 text-gray-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Todos"
              >
                <Users size={14} />
              </button>
              <button
                onClick={() => updateChartData('Masculino')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  genderFilter === 'Masculino'
                    ? 'bg-gray-200 text-gray-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Masculino"
              >
                M
              </button>
              <button
                onClick={() => updateChartData('Feminino')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  genderFilter === 'Feminino'
                    ? 'bg-gray-200 text-gray-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Feminino"
              >
                F
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center">
          {!chartsLoaded ? (
            <>
              <div className="w-12 h-12 border-4 border-gray-300 border-t-[#6DBFAC] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Carregando gráfico...</p>
            </>
          ) : chartOptions.series.length === 0 ? (
            <>
              <div className="w-12 h-12 border-4 border-gray-300 border-t-[#6DBFAC] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Carregando dados...</p>
            </>
          ) : (
            <>
              <p className="text-gray-500">Erro ao carregar gráfico</p>
              <p className="text-xs text-gray-400 mt-2">Séries: {chartOptions.series?.length || 0}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ChartWithGenderFilter({ title, series, profileData, filters, index, globalGenderFilter }: any) {
  const [genderFilter, setGenderFilter] = useState('all');
  const [chartSeries, setChartSeries] = useState(series);

  useEffect(() => {
    setGenderFilter(globalGenderFilter);
    const data = aggregateProfileData(profileData, filters, globalGenderFilter);
    
    const dataMap: any = {
      0: data.dayAggregate,
      1: data.yearAggregate,
      2: data.needAggregate,
      3: data.startAggregate,
      4: data.continueAggregate,
      5: data.issueAggregate,
      6: data.collisionAggregate,
      7: data.ageAggregate,
      8: data.schoolingAggregate,
      9: data.incomeAggregate,
      10: data.workDaysAggregate,
      11: data.leisureDaysAggregate,
      12: data.transportCombinationAggregate,
    };
    
    setChartSeries(dataMap[index] || []);
  }, [globalGenderFilter, filters, profileData, index]);

  const updateChartData = (gender: string) => {
    setGenderFilter(gender);
    const data = aggregateProfileData(profileData, filters, gender);
    
    const dataMap: any = {
      0: data.dayAggregate,
      1: data.yearAggregate,
      2: data.needAggregate,
      3: data.startAggregate,
      4: data.continueAggregate,
      5: data.issueAggregate,
      6: data.collisionAggregate,
      7: data.ageAggregate,
      8: data.schoolingAggregate,
      9: data.incomeAggregate,
      10: data.workDaysAggregate,
      11: data.leisureDaysAggregate,
      12: data.transportCombinationAggregate,
    };
    
    setChartSeries(dataMap[index] || []);
  };

  return (
    <HorizontalBarChart 
      title={title} 
      series={chartSeries} 
      genderFilter={genderFilter}
      onGenderChange={updateChartData}
    />
  );
}

function PerfilClientSide({ apiDown, profileData }: { apiDown?: boolean, profileData?: any[] }) {
  const [filters, setFilters] = useState(getInicialFilters());
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [globalGenderFilter, setGlobalGenderFilter] = useState('all');
  const filterRef = useRef<HTMLDivElement>(null);

  const [dayData, setDayData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [needData, setNeedData] = useState([]);
  const [startData, setStartData] = useState([]);
  const [continueData, setContinueData] = useState([]);
  const [issueData, setIssueData] = useState([]);
  const [collisionData, setCollisionData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [schoolingData, setSchoolingData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [workDaysData, setWorkDaysData] = useState([]);
  const [leisureDaysData, setLeisureDaysData] = useState([]);
  const [transportCombinationData, setTransportCombinationData] = useState([]);
  const [distanceOptions, setDistanceOptions] = useState(getHistogramData([]));

  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [globalGenderFilter, filters]);

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
    if (apiDown || !profileData) {
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const data = aggregateProfileData(profileData, getInicialFilters());
        console.log('Setting states with data:', data);
        setDayData(data.dayAggregate || []);
        setYearData(data.yearAggregate || []);
        setNeedData(data.needAggregate || []);
        setStartData(data.startAggregate || []);
        setContinueData(data.continueAggregate || []);
        setIssueData(data.issueAggregate || []);
        setCollisionData(data.collisionAggregate || []);
        setAgeData(data.ageAggregate || []);
        setSchoolingData(data.schoolingAggregate || []);
        setIncomeData(data.incomeAggregate || []);
        setWorkDaysData(data.workDaysAggregate || []);
        setLeisureDaysData(data.leisureDaysAggregate || []);
        setTransportCombinationData(data.transportCombinationAggregate || []);
        setDistanceOptions(() => {
          const histogram = getHistogramData(data.distancesByColorRace || {});
          console.log('Histogram data:', histogram);
          return histogram;
        });
        console.log('States set, dayData should have:', data.dayAggregate?.length, 'items');
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [apiDown, profileData]);

  const applyFilters = async () => {
    if (apiDown || !profileData) return;
    
    try {
      const data = aggregateProfileData(profileData, filters, globalGenderFilter);
      setDayData(data.dayAggregate || []);
      setYearData(data.yearAggregate || []);
      setNeedData(data.needAggregate || []);
      setStartData(data.startAggregate || []);
      setContinueData(data.continueAggregate || []);
      setIssueData(data.issueAggregate || []);
      setCollisionData(data.collisionAggregate || []);
      setAgeData(data.ageAggregate || []);
      setSchoolingData(data.schoolingAggregate || []);
      setIncomeData(data.incomeAggregate || []);
      setWorkDaysData(data.workDaysAggregate || []);
      setLeisureDaysData(data.leisureDaysAggregate || []);
      setTransportCombinationData(data.transportCombinationAggregate || []);
      setDistanceOptions(() => {
        const histogram = getHistogramData(data.distancesByColorRace || {});
        return histogram;
      });
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
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
        "Quantos dias da semana costuma utilizar a bicicleta como meio de transporte?",
      series: dayData,
    },
    {
      title: "Há quanto tempo utiliza a bicicleta como meio de transporte?",
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
    {
      title: "Faixa etária",
      series: ageData,
    },
    {
      title: "Escolaridade",
      series: schoolingData,
    },
    {
      title: "Faixa salarial",
      series: incomeData,
    },
    {
      title: "Dias de uso para trabalho",
      series: workDaysData,
    },
    {
      title: "Dias de uso para lazer",
      series: leisureDaysData,
    },
    {
      title: "Combinação com transporte",
      series: transportCombinationData,
    },
  ];
  
  console.log('Rendering with options:', options.map(o => ({ title: o.title, seriesLength: o.series[0]?.data?.length })));

  return (
    <>
      <div ref={filterRef}>
        <section 
          className={`transition-all duration-300 ${
            isSticky 
              ? 'fixed top-14 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200' 
              : 'relative bg-gray-50'
          }`}
          role="region"
          aria-label={isSticky ? "Barra de filtros fixada no topo da tela" : "Barra de filtros"}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtros</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Gênero:</span>
                  <div className="flex gap-1 border border-gray-300 rounded p-1">
                    <button
                      onClick={() => setGlobalGenderFilter('all')}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        globalGenderFilter === 'all'
                          ? 'bg-gray-200 text-gray-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Todos"
                    >
                      <Users size={14} />
                    </button>
                    <button
                      onClick={() => setGlobalGenderFilter('Masculino')}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        globalGenderFilter === 'Masculino'
                          ? 'bg-gray-200 text-gray-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Masculino"
                    >
                      M
                    </button>
                    <button
                      onClick={() => setGlobalGenderFilter('Feminino')}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        globalGenderFilter === 'Feminino'
                          ? 'bg-gray-200 text-gray-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Feminino"
                    >
                      F
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Cor/Raça:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {filters.map((f, i) => (
                      <button
                        key={f.value}
                        onClick={() => toggleFilter(f, i)}
                        disabled={apiDown}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          f.checked
                            ? 'bg-ameciclo text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {f.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {isSticky && <div className="h-16"></div>}

      <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 auto-rows-auto gap-6 my-10 px-4">
        {options.map((option, index) => {
          const hasData = option.series && option.series.length > 0 && option.series.some((s: any) => s.data && s.data.length > 0 && s.data.some((d: any) => d.y > 0));
          
          return hasData ? (
            <ChartWithGenderFilter 
              key={index} 
              {...option} 
              profileData={profileData}
              filters={filters}
              index={index}
              globalGenderFilter={globalGenderFilter}
            />
          ) : (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">{option.title}</h3>
              <div className="h-64 flex flex-col items-center justify-center">
                <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
              </div>
            </div>
          );
        })}
        <HistogramWithGenderFilter
          distanceOptions={distanceOptions}
          profileData={profileData}
          filters={filters}
          globalGenderFilter={globalGenderFilter}
          chartsLoaded={chartsLoaded}
          Highcharts={Highcharts}
          HighchartsReact={HighchartsReact}
        />
      </section>

      <section className="container mx-auto px-4 my-16">
        <div className="bg-gradient-to-br from-ameciclo/5 to-ameciclo/10 rounded-xl p-8 border border-ameciclo/20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-ameciclo" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Estudos e Análises Completas</h2>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                Acesse relatórios técnicos, pesquisas históricas e análises detalhadas sobre mobilidade por bicicleta<br />
                no Recife produzidos pela Ameciclo ao longo dos anos
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://drive.google.com/uc?export=download&id=1Ww5YKKtK7loXFg8ELxgm7kkalkI3A0rk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Evolução de Perfil Ciclista Recife - PE</h3>
                  <p className="text-sm text-gray-500 mt-1">2025</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a 
              href="https://drive.google.com/uc?export=download&id=1yW7sEU-y4BpIdZZeg1LpU0J2buaAuBWB"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Pesquisa Perfil do Ciclista</h3>
                  <p className="text-sm text-gray-500 mt-1">2018</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a 
              href="https://drive.google.com/uc?export=download&id=0BzQ5vNvMmIF4YmRVRnFWd1BTNG8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Pesquisa Perfil do Ciclista</h3>
                  <p className="text-sm text-gray-500 mt-1">2015</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>

            <a 
              href="https://drive.google.com/uc?export=download&id=0BxR5Ri6g5X_ZN0ZaVzdXYTdQSUk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-5 border border-gray-200 hover:border-ameciclo hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-ameciclo transition-colors">Mobilidade por Bicicleta no Recife</h3>
                  <p className="text-sm text-gray-500 mt-1">Diagnóstico e ações estratégicas (2013)</p>
                </div>
                <Download className="text-gray-400 group-hover:text-ameciclo transition-colors" size={20} />
              </div>
            </a>
          </div>
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
